"use client";

import { ArrowDownIcon, UserFilledIcon, PlusIcon, SearchIcon } from "@/icons";
import React, { Suspense, useState } from "react";
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

import AdminListView from "@/app/components/ui/cards/AdminListView";
import AddAdminModal from "@/app/components/ui/modals/AddAdminModal";
import ResendInvitationModal from "@/app/components/ui/modals/ResendInvitationModal";
import AppModal from "@/app/components/ui/modals/AppModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ALL_ADMINS } from "@/lib/graphql/queries";
import { MODIFY_ACCESSS_USER } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

// Interface for GraphQL response
interface AllAdminsResponse {
  allAdmins: {
    allData: UserAttributes[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

interface AdminFormData {
  id?: string | number;
  fullName?: string;
  phoneNo?: string;
  email?: string;
  status?: string;
}

function AdminsContent() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminFormData>();
  const [adminToResend, setAdminToResend] = useState<AdminFormData>();

  // Tab state for Active/Pending admins
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
  const { data, loading, error, refetch } = useQuery<AllAdminsResponse>(
    ALL_ADMINS,
    {
      variables: {
        search: search,
        status:
          selectedStatus === "All Status"
            ? undefined
            : selectedStatus.toUpperCase(),
        pendingInvites: selectedTabIndex === 1, // true for pending admins (index 1), false for active admins (index 0)
        page: currentPage + 1,
        perPage: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  // GraphQL mutation for modifying user access
  const [modifyAccessUser, { loading: modifyLoading }] =
    useMutation(MODIFY_ACCESSS_USER);

  // Transform GraphQL data to match Admin interface
  const admins = data?.allAdmins.allData;

  const pageCount = data?.allAdmins.totalPages;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleDelete = (admin: AdminFormData) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete?.id) return;

    try {
      await modifyAccessUser({
        variables: {
          userId: adminToDelete.id,
          revokeAccess: true,
        },
      });

      // Show success message
      showSuccessToast("Admin deleted successfully");

      // Close modal and refetch data
      setIsDeleteModalOpen(false);
      setAdminToDelete(undefined);
      refetch();
    } catch (error) {
      console.error("Error revoking admin access:", error);
      showErrorToast("Failed to delete admin. Please try again.");
    }
  };

  const handleResendInvitation = (adminId: string | number) => {
    const admin = admins?.find(
      (a) => a.id === adminId || a.id === String(adminId)
    );
    if (admin) {
      setAdminToResend({
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        phoneNo: admin.phoneNo,
        status: admin.status,
      });
      setIsResendModalOpen(true);
    }
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <UserFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Admins
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

          <ThemeButton
            label="Add New"
            icon={<PlusIcon />}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Tabs for Active/Pending Admins */}
      <div className="bg-white rounded-xl shadow-table">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList className="flex items-center border-b border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-6">
            {["All Admins", "Pending Admins"].map((tab, index) => (
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
                  <div className="col-span-4">
                    <h2>Name</h2>
                  </div>
                  <div className="col-span-3">
                    <h2>Phone</h2>
                  </div>
                  <div className="col-span-2">
                    <h2>Status</h2>
                  </div>
                  <div className="col-span-3">
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
                    {admins?.map((admin: UserAttributes) => (
                      <AdminListView
                        key={admin.id}
                        admin={admin}
                        onDeleteAdmin={() => handleDelete(admin)}
                        onResendInvitation={() =>
                          admin.id && handleResendInvitation(admin.id)
                        }
                      />
                    ))}
                  </>
                )}
                {(!admins || admins.length === 0) && !loading && <EmptyState />}

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
                  <div className="col-span-4">
                    <h2>Name</h2>
                  </div>
                  <div className="col-span-3">
                    <h2>Phone</h2>
                  </div>
                  <div className="col-span-2">
                    <h2>Status</h2>
                  </div>
                  <div className="col-span-3">
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
                    {admins?.map((admin: UserAttributes) => (
                      <AdminListView
                        key={admin.id}
                        admin={admin}
                        onDeleteAdmin={() => handleDelete(admin)}
                        onResendInvitation={() =>
                          admin.id && handleResendInvitation(admin.id)
                        }
                      />
                    ))}
                  </>
                )}
                {(!admins || admins.length === 0) && !loading && <EmptyState />}

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

      <AddAdminModal
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
          setAdminToDelete(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confimBtnDisable={modifyLoading}
        size="small"
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this admin? This action cannot be
            undone.
          </p>
        </div>
      </AppModal>

      <ResendInvitationModal
        isOpen={isResendModalOpen}
        onClose={() => {
          setIsResendModalOpen(false);
          setAdminToResend(undefined);
        }}
        doctorName={adminToResend?.fullName}
        doctorId={adminToResend?.id}
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
      <AdminsContent />
    </Suspense>
  );
}
