"use client";

import { SearchIcon, UserAddIcon, UserGroupIcon } from "@/icons";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import {
  EmptyState,
  Loader,
  ThemeButton,
  CustomerDatabaseView,
  Pagination,
  Skeleton,
} from "@/app/components";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_PATIENTS } from "@/lib/graphql/queries";
import {
  MODIFY_ACCESSS_USER,
  RESEND_INVITATION,
} from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/useIsMobile";
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
import { ArrowDownIcon } from "@/icons";
import AddCustomerModal from "@/app/components/ui/modals/AddCustomerModal";
import AppModal from "@/app/components/ui/modals/AppModal";
import ResendInvitationModal from "@/app/components/ui/modals/ResendInvitationModal";

// Interface for GraphQL response
interface AllPatientsResponse {
  allPatients: {
    allData: UserAttributes[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

interface PatientFormData {
  id?: string | number;
  fullName?: string;
  phoneNo?: string;
  email?: string;
  address?: string;
  status?: string;
  patientOrdersCount?: string;
}

function CustomerContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<PatientFormData>();
  const [patientToResend, setPatientToResend] = useState<PatientFormData>();

  // Tab state for All Patients/Pending Patients
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const statusOptions = [
    { label: "All Status", value: null },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Pending", value: "PENDING" },
  ];

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState(0);

  // GraphQL query with variables
  const { data, loading, error, refetch } = useQuery<AllPatientsResponse>(
    ALL_PATIENTS,
    {
      variables: {
        search: search,
        status:
          selectedStatus === "All Status"
            ? undefined
            : selectedStatus.toUpperCase(),
        pendingInvites: selectedTabIndex === 1, // true for pending patients (index 1), false for all patients (index 0)
        page: currentPage + 1,
        perPage: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // GraphQL mutation for modifying user access
  const [modifyAccessUser, { loading: modifyLoading }] =
    useMutation(MODIFY_ACCESSS_USER);

  // Transform GraphQL data to match Patient interface
  const patients = data?.allPatients.allData;
  const pageCount = data?.allPatients.totalPages;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete?.id) return;

    try {
      await modifyAccessUser({
        variables: {
          userId: patientToDelete.id,
          revokeAccess: true,
        },
      });

      // Show success message
      showSuccessToast("Patient deleted successfully");

      // Close modal and refetch data
      setIsDeleteModalOpen(false);
      setPatientToDelete(undefined);
      refetch();
    } catch (error) {
      console.error("Error revoking patient access:", error);
      showErrorToast("Failed to delete patient. Please try again.");
    }
  };

  const handleResendInvitation = (patientId: string | number) => {
    console.log("handleResendInvitation called with patientId:", patientId);
    const patient = patients?.find(
      (p) => p.id === patientId || p.id === String(patientId)
    );
    if (patient) {
      setPatientToResend({
        id: patient.id,
        fullName: patient.fullName,
        email: patient.email,
        phoneNo: patient.phoneNo,
        address: patient.address,
        status: patient.status,
        patientOrdersCount: patient.patientOrdersCount,
      });
      setIsResendModalOpen(true);
      console.log("Modal should be opening now");
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <UserGroupIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="w-full text-black font-semibold text-lg md:text-2xl lg:3xl">
            Customer Database
          </h2>
        </div>

        <div className="sm:bg-white rounded-full w-full flex flex-col sm:flex-row items-center gap-1 md:gap-2 sm:p-1.5 md:px-2.5 md:py-2 sm:shadow-table lg:w-fit">
          <div className="flex items-center relative w-full bg-white sm:p-0 sm:bg-transparent p-1 rounded-full shadow-table sm:shadow-none">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <div className="flex items-center gap-1 md:gap-2 bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full shadow-table sm:shadow-none">
            <Menu>
              <MenuButton className="w-full sm:w-fit flex whitespace-nowrap justify-between py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-sm/6 font-medium shadow-inner focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                {selectedStatus} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-44 z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {statusOptions.map((status) => (
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
              icon={<UserAddIcon />}
              label="Add New Customer"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Tabs for All Patients/Pending Patients */}
      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList className="flex items-center border-b bg-white rounded-t-xl mb-2 sm:mb-0 border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-4">
            {["All Patients", "Pending Patients"].map((tab, index) => (
              <Tab
                key={index}
                as="button"
                className="flex items-center gap-1 md:gap-2 w-full justify-center text-[11px] hover:bg-gray-50 whitespace-nowrap md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-2 py-2.5 md:py-4 md:px-6"
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium shadow-table bg-white rounded-xl text-black">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-1">Date of Birth</div>
                  <div className="col-span-1">Last Order</div>
                  <div className="col-span-1">Total Orders</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-center">Actions</div>
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
                    {patients?.map((patient: UserAttributes) => (
                      <CustomerDatabaseView
                        onRowClick={() =>
                          router.push(`/customers/${patient.id}`)
                        }
                        key={patient.id}
                        patient={patient}
                        onViewCustomer={() =>
                          router.push(`/customers/${patient.id}`)
                        }
                        onResendInvitation={() =>
                          patient.id && handleResendInvitation(patient.id)
                        }
                      />
                    ))}
                  </>
                )}

                {(!patients || patients.length === 0) && !loading && (
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
              <div className="space-y-1 p-0 md:p-6 pt-0">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium shadow-table bg-white rounded-xl text-black">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-1">Date of Birth</div>
                  <div className="col-span-1">Last Order</div>
                  <div className="col-span-1">Total Orders</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-center">Actions</div>
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
                    {patients?.map((patient: UserAttributes) => (
                      <CustomerDatabaseView
                        onRowClick={() =>
                          router.push(`/customers/${patient.id}`)
                        }
                        key={patient.id}
                        patient={patient}
                        onViewCustomer={() =>
                          router.push(`/customers/${patient.id}`)
                        }
                        onResendInvitation={() =>
                          patient.id && handleResendInvitation(patient.id)
                        }
                      />
                    ))}
                  </>
                )}

                {(!patients || patients.length === 0) && !loading && (
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

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onConfirm={() => {
          setIsModalOpen(false);
          refetch(); // Refetch data after adding
        }}
      />

      <AppModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPatientToDelete(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Patient?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confimBtnDisable={modifyLoading}
        size="small"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this patient? This action cannot be
            undone.
          </p>
        </div>
      </AppModal>

      <ResendInvitationModal
        isOpen={isResendModalOpen}
        onClose={() => {
          setIsResendModalOpen(false);
          setPatientToResend(undefined);
        }}
        doctorName={patientToResend?.fullName}
        doctorId={patientToResend?.id}
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
      <CustomerContent />
    </Suspense>
  );
}
