"use client";

import { ArrowDownIcon, DoctorFilledIcon, PlusIcon, SearchIcon } from "@/icons";
import React, { Suspense, useState } from "react";
import {
  EmptyState,
  Loader,
  Skeleton,
  ThemeButton,
  Pagination,
} from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useQuery, useMutation } from "@apollo/client/react";

import DoctorListView from "@/app/components/ui/cards/DoctorListView";
import AddEditDoctorModal from "@/app/components/ui/modals/AddEditDoctorModal";
import CsvImportDoctorModal from "@/app/components/ui/modals/CsvImportDoctorModal";
import DoctorDeleteModal from "@/app/components/ui/modals/DoctorDeleteModal";
import ResendInvitationModal from "@/app/components/ui/modals/ResendInvitationModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ALL_DOCTORS } from "@/lib/graphql/queries";
import { MODIFY_ACCESSS_USER } from "@/lib/graphql/mutations";
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
  
  // Tab state for Active/Pending doctors
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  
  const orderStatuses = [
    { label: "All Status", value: null },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  const [currentPage, setCurrentPage] = useState(0);

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
        pendingInvites: selectedTabIndex === 1, // true for pending doctors (index 1), false for active doctors (index 0)
        page: currentPage + 1,
        perPage: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // GraphQL mutation for modifying user access
  const [modifyAccessUser, { loading: modifyLoading }] =
    useMutation(MODIFY_ACCESSS_USER);

  // Transform GraphQL data to match Doctor interface
  const doctors = data?.allDoctors.allData;
  
  // Debug log to check doctors data
  console.log("All doctors:", doctors?.map(d => ({ id: d.id, name: d.fullName, invitationStatus: d.invitationStatus })));

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
    const doctor = doctors?.find(d => d.id === doctorId || d.id === String(doctorId));
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

  const isMobile = useIsMobile();

  // Show error state

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <DoctorFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Doctors
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-table w-fit">
          <div className="flex items-center relative">
            <span className="absolute left-3">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 min-w-80 focus:bg-white outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <Menu>
            <MenuButton className="inline-flex py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full  text-sm/6 font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
              {selectedStatus} <ArrowDownIcon fill="#717680" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
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
          <ThemeButton label="Import" onClick={() => setIsCsvImportModalOpen(true)} />

          <ThemeButton
            label="Add New"
            icon={<PlusIcon />}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Tabs for Active/Pending Doctors */}
      <div className="bg-white rounded-xl shadow-table">
        <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
          <TabList className="flex items-center border-b border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-6">
            {["All Doctors", "Pending Doctors"].map((tab, index) => (
              <Tab
                key={index}
                as="button"
                className="flex items-center gap-1 md:gap-2 w-full justify-center text-[11px] hover:bg-gray-50 whitespace-nowrap md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-2 py-3 md:py-4 md:px-6"
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="space-y-1 p-4 md:p-6 pt-0">
        <div className="grid grid-cols-12 text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
          <div className="col-span-3">
            <h2>Name</h2>
          </div>
          <div className="col-span-2">
            <h2>Specialty</h2>
          </div>
          <div className="col-span-2">
            <h2>Phone</h2>
          </div>
          <div className="col-span-2">
            <h2>Medical License</h2>
          </div>
          <div className="col-span-1">
            <h2>Status</h2>
          </div>
          <div className="col-span-1">
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
                onResendInvitation={() => doctor.id && handleResendInvitation(doctor.id)}
              />
            ))}
          </>
        )}
        {(!doctors || doctors.length === 0) && !loading && <EmptyState />}

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
              <div className="space-y-1 p-4 md:p-6 pt-0">
                <div className="grid grid-cols-12 text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
                  <div className="col-span-3">
                    <h2>Name</h2>
                  </div>
                  <div className="col-span-2">
                    <h2>Specialty</h2>
                  </div>
                  <div className="col-span-2">
                    <h2>Phone</h2>
                  </div>
                  <div className="col-span-2">
                    <h2>Medical License</h2>
                  </div>
                  <div className="col-span-1">
                    <h2>Status</h2>
                  </div>
                  <div className="col-span-1">
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
                        onResendInvitation={() => doctor.id && handleResendInvitation(doctor.id)}
                      />
                    ))}
                  </>
                )}
                {(!doctors || doctors.length === 0) && !loading && <EmptyState />}

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
