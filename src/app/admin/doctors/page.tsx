"use client";

import { ArrowDownIcon, DoctorFilledIcon, PlusIcon, SearchIcon } from "@/icons";
import React, { Suspense, useState, useEffect } from "react";
import {
  EmptyState,
  Loader,
  Skeleton,
  ThemeButton,
  Pagination,
} from "@/app/components";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { useQuery, useMutation } from "@apollo/client/react";

import DoctorListView from "@/app/components/ui/cards/DoctorListView";
import AddEditDoctorModal from "@/app/components/ui/modals/AddEditDoctorModal";
import CsvImportDoctorModal from "@/app/components/ui/modals/CsvImportDoctorModal";
import DoctorDeleteModal from "@/app/components/ui/modals/DoctorDeleteModal";
import ResendInvitationModal from "@/app/components/ui/modals/ResendInvitationModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ALL_DOCTORS } from "@/lib/graphql/queries";
import { MODIFY_ACCESSS_USER, EXPORT_DOCTORS } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

// Interface for GraphQL response
interface AllDoctorsResponse {
  allDoctors: {
    allData: UserAttributes[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

interface DoctorFormData {
  id?: string | number;
  fullName?: string;
  phoneNo?: string;
  email?: string;
  medicalLicense?: string;
  specialty?: string;
  status?: string;
}

function DoctorContent() {
  const [search, setSearch] = useState("");
  const [isModalOpne, setIsModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);
  const [isDeleteModalOpne, setIsDeleteModalOpen] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorFormData>();
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorFormData>();
  const [doctorToResend, setDoctorToResend] = useState<DoctorFormData>();

  // Tab state: 0 = All, 1 = Active, 2 = Pending
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const orderStatuses = [
    { label: "All Status", value: null },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  const [currentPage, setCurrentPage] = useState(0);

  // Sync status when switching tabs: Active tab → "Active", All tab → "All Status"
  useEffect(() => {
    if (selectedTabIndex === 1) {
      setSelectedStatus("Active");
    } else if (selectedTabIndex === 0) {
      setSelectedStatus("All Status");
    }
  }, [selectedTabIndex]);

  // GraphQL query with variables
  const { data, loading, error, refetch } = useQuery<AllDoctorsResponse>(
    ALL_DOCTORS,
    {
      variables: {
        search: search,
        status:
          selectedStatus === "All Status"
            ? undefined
            : selectedStatus.toUpperCase(),
        pendingInvites:
          selectedTabIndex === 0
            ? undefined
            : selectedTabIndex === 2,
        page: currentPage + 1,
        perPage: itemsPerPage,
      },
      fetchPolicy: "network-only",
    },
  );

  // GraphQL mutation for modifying user access
  const [modifyAccessUser, { loading: modifyLoading }] =
    useMutation(MODIFY_ACCESSS_USER);

  // GraphQL mutation for exporting doctors
  const [exportDoctors, { loading: exportLoading }] = useMutation(EXPORT_DOCTORS);

  // Transform GraphQL data to match Doctor interface
  const doctors = data?.allDoctors.allData;

  // Debug log to check doctors data

  const pageCount = data?.allDoctors.totalPages;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleEdit = (doctor: DoctorFormData) => {
    setEditDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = (doctor: DoctorFormData) => {
    setDoctorToDelete(doctor);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
    // Sync tab with status: Active → Active Doctors tab, others → All Doctors tab
    if (status === "Active") {
      setSelectedTabIndex(1);
    } else {
      setSelectedTabIndex(0);
    }
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete?.id) return;

    try {
      await modifyAccessUser({
        variables: {
          userId: doctorToDelete.id,
          revokeAccess: true,
        },
      });

      // Show success message
      showSuccessToast("Doctor deleted successfully");

      // Close modal and refetch data
      setIsDeleteModalOpen(false);
      setDoctorToDelete(undefined);
      refetch();
    } catch (error) {
      console.error("Error revoking doctor access:", error);
      showErrorToast("Failed to delete doctor. Please try again.");
    }
  };

  const handleResendInvitation = (doctorId: string | number) => {
    console.log("handleResendInvitation called with doctorId:", doctorId);
    const doctor = doctors?.find(
      (d) => d.id === doctorId || d.id === String(doctorId),
    );
    console.log("Found doctor:", doctor);
    if (doctor) {
      setDoctorToResend({
        id: doctor.id,
        fullName: doctor.fullName,
        email: doctor.email,
        phoneNo: doctor.phoneNo,
        medicalLicense: doctor.medicalLicense,
        specialty: doctor.specialty,
        status: doctor.status,
      });
      setIsResendModalOpen(true);
      console.log("Modal should be opening now");
    }
  };

  const handleExportDoctors = async () => {
    try {
      const { data } = await exportDoctors({
        variables: {
          status:
            selectedStatus === "All Status"
              ? undefined
              : selectedStatus.toUpperCase(),
          pendingInvites:
            selectedTabIndex === 0 ? undefined : selectedTabIndex === 2,
          search: search || undefined,
        },
      });

      if (data?.exportDoctors?.csvData && data?.exportDoctors?.fileName) {
        // Try to decode base64 CSV data, fallback to plain text if it fails
        let csvContent: string;
        try {
          csvContent = atob(data.exportDoctors.csvData);
        } catch (e) {
          // If decoding fails, assume it's already plain text
          csvContent = data.exportDoctors.csvData;
        }
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", data.exportDoctors.fileName);
        link.style.visibility = "hidden";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showSuccessToast("Doctors exported successfully");
      } else {
        showErrorToast("Failed to export doctors. No data received.");
      }
    } catch (error) {
      console.error("Error exporting doctors:", error);
      showErrorToast("Failed to export doctors. Please try again.");
    }
  };

  const isMobile = useIsMobile();

  // Show error state

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <DoctorFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="lg:w-full text-black font-semibold text-xl md:text-3xl lg:4xl">
            Doctors
          </h2>
        </div>

        <div className="sm:bg-white rounded-full w-full flex flex-col sm:flex-row items-center gap-1 md:gap-2 sm:p-1.5 md:px-2.5 md:py-2 sm:shadow-table lg:w-fit">
          <div className="flex items-center relative bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full  shadow-table sm:shadow-none">
            <span className="absolute left-3">
              <SearchIcon
                height={isMobile ? "16" : "20"}
                width={isMobile ? "16" : "20"}
              />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <div className="flex items-center gap-1 md:gap-2 bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full shadow-table sm:shadow-none">
            <Menu>
              <MenuButton className="w-full sm:w-fit whitespace-nowrap flex justify-between py-1.5 sm:py-2 px-2 sm:px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-sm/6 font-medium shadow-inner focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                {selectedStatus} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor={isMobile ? "bottom end" : "bottom end"}
                className={`min-w-40 sm:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {orderStatuses.map((status) => (
                  <MenuItem key={status.label}>
                    <button
                      onClick={() => handleStatusChange(status.label)}
                      className="flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full"
                    >
                      {status.label}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
            <ThemeButton
              label="Import"
              size={isMobile ? "small" : "medium"}
              onClick={() => setIsCsvImportModalOpen(true)}
              heightClass="h-9 sm:h-auto"
            />

            <ThemeButton
              label="Export"
              size={isMobile ? "small" : "medium"}
             
              onClick={handleExportDoctors}
              heightClass="h-9 sm:h-auto"
              disabled={exportLoading}
            />

            <ThemeButton
              label="Add New"
              size={isMobile ? "small" : "medium"}
              icon={<PlusIcon />}
              onClick={() => setIsModalOpen(true)}
              heightClass="h-9 sm:h-auto"
            />
          </div>
        </div>
      </div>

      {/* Tabs for All/Active/Pending Doctors */}
      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList className="flex items-center border-b bg-white rounded-t-xl mb-2 sm:mb-0 border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-4">
            {["All Doctors", "Active Doctors", "Pending Doctors"].map((tab, index) => (
              <Tab
                key={index}
                as="button"
                className="flex items-center gap-1 md:gap-2 w-full justify-center hover:bg-gray-50 whitespace-nowrap md:text-base text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-1.5 py-2.5 md:py-4 md:px-6"
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid  grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_0.5fr] xl:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_0.5fr] text-black font-medium text-sm  px-2 py-2.5 bg-white rounded-xl shadow-table">
                  <div>
                    <h2>Name</h2>
                  </div>
                  <div>
                    <h2>Specialty</h2>
                  </div>
                  <div>
                    <h2>Clinic</h2>
                  </div>
                  <div>
                    <h2>Phone</h2>
                  </div>
                  <div>
                    <h2>Medical License</h2>
                  </div>
                  <div className="xl:flex hidden">
                    <h2>Status</h2>
                  </div>
                  <div>
                    <h2>Invitation</h2>
                  </div>
                  <div>
                    <h2>Actions</h2>
                  </div>
                </div>
                {error && (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">{error.message}</p>
                  </div>
                )}

                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  <>
                    {doctors?.map((doctor: UserAttributes) => (
                      <DoctorListView
                        // onRowClick={() => router.push(`/orders/${doctor.id}`)}
                        key={doctor.id}
                        doctor={doctor}
                        onEditDoctor={() => handleEdit(doctor)}
                        onDeleteDoctor={() => handleDelete(doctor)}
                        onResendInvitation={() =>
                          doctor.id && handleResendInvitation(doctor.id)
                        }
                      />
                    ))}
                  </>
                )}
                {(!doctors || doctors.length === 0) && !loading && (
                  <EmptyState />
                )}

                {pageCount && pageCount > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pageCount}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </TabPanel>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid  grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_0.5fr] xl:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_0.5fr] text-black font-medium text-sm  px-2 py-2.5 bg-white rounded-xl shadow-table">
                  <div>
                    <h2>Name</h2>
                  </div>
                  <div>
                    <h2>Specialty</h2>
                  </div>
                  <div>
                    <h2>Clinic</h2>
                  </div>
                  <div>
                    <h2>Phone</h2>
                  </div>
                  <div>
                    <h2>Medical License</h2>
                  </div>
                  <div className="xl:flex hidden">
                    <h2>Status</h2>
                  </div>
                  <div>
                    <h2>Invitation</h2>
                  </div>
                  <div>
                    <h2>Actions</h2>
                  </div>
                </div>
                {error && (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">{error.message}</p>
                  </div>
                )}

                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  <>
                    {doctors?.map((doctor: UserAttributes) => (
                      <DoctorListView
                        key={doctor.id}
                        doctor={doctor}
                        onEditDoctor={() => handleEdit(doctor)}
                        onDeleteDoctor={() => handleDelete(doctor)}
                        onResendInvitation={() =>
                          doctor.id && handleResendInvitation(doctor.id)
                        }
                      />
                    ))}
                  </>
                )}
                {(!doctors || doctors.length === 0) && !loading && (
                  <EmptyState />
                )}

                {pageCount && pageCount > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pageCount}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </TabPanel>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_0.5fr] xl:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_0.5fr] text-black font-medium text-sm  px-2 py-2.5 bg-white rounded-xl shadow-table">
                  <div>
                    <h2>Name</h2>
                  </div>
                  <div>
                    <h2>Specialty</h2>
                  </div>
                  <div>
                    <h2>Clinic</h2>
                  </div>
                  <div>
                    <h2>Phone</h2>
                  </div>
                  <div>
                    <h2>Medical License</h2>
                  </div>
                  <div className="xl:flex hidden">
                    <h2>Status</h2>
                  </div>
                  <div>
                    <h2>Invitation</h2>
                  </div>
                  <div>
                    <h2>Actions</h2>
                  </div>
                </div>
                {error && (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">{error.message}</p>
                  </div>
                )}

                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  <>
                    {doctors?.map((doctor: UserAttributes) => (
                      <DoctorListView
                        key={doctor.id}
                        doctor={doctor}
                        onEditDoctor={() => handleEdit(doctor)}
                        onDeleteDoctor={() => handleDelete(doctor)}
                        onResendInvitation={() =>
                          doctor.id && handleResendInvitation(doctor.id)
                        }
                      />
                    ))}
                  </>
                )}
                {(!doctors || doctors.length === 0) && !loading && (
                  <EmptyState />
                )}

                {pageCount && pageCount > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pageCount}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <AddEditDoctorModal
        isOpen={isModalOpne}
        onClose={() => {
          setIsModalOpen(false);
          setEditDoctor(undefined);
        }}
        onConfirm={() => {
          setIsModalOpen(false);
          setEditDoctor(undefined);
          refetch(); // Refetch data after adding/editing
        }}
        initialData={editDoctor}
      />

      <CsvImportDoctorModal
        isOpen={isCsvImportModalOpen}
        onClose={() => {
          setIsCsvImportModalOpen(false);
        }}
        onConfirm={() => {
          setIsCsvImportModalOpen(false);
          refetch(); // Refetch data after importing
        }}
      />

      <DoctorDeleteModal
        isOpen={isDeleteModalOpne}
        onDelete={handleConfirmDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDoctorToDelete(undefined);
        }}
        subtitle="Are you sure you want to delete this doctor? This action cannot be undone."
        title="Delete Doctor?"
        isLoading={modifyLoading}
        isMobile={isMobile}
      />

      <ResendInvitationModal
        isOpen={isResendModalOpen}
        onClose={() => {
          setIsResendModalOpen(false);
          setDoctorToResend(undefined);
        }}
        doctorName={doctorToResend?.fullName}
        doctorId={doctorToResend?.id}
        onSuccess={() => {
          refetch(); // Refetch data after resending invitation
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <DoctorContent />
    </Suspense>
  );
}
