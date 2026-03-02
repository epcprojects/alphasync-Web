"use client";

import {
  AddEditManagerModal,
  EmptyResult,
  Pagination,
  Skeleton,
  ThemeButton,
} from "@/app/components";
import { useMutation, useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  AdminManagersFilledIcon,
  ArrowDownIcon,
  NoUserIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ALL_MANAGERS } from "@/lib/graphql/queries";
import { MODIFY_ACCESSS_USER } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
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
import ManagersDatabaseView, {
  ManagersType,
} from "@/app/components/ui/cards/ManagersDatabaseView";
import AssignDoctorModal from "@/app/components/ui/modals/AssignDoctorModal";

/** Assigned doctor fields returned by allManagers.allData.assignedDoctors */
export interface ManagerAssignedDoctor {
  id?: string | number;
  deleted?: boolean;
  email?: string;
  firstName?: string;
  fullName?: string;
  status?: string;
  imageUrl?: string | null;
  specialty?: string;
  phoneNo?: string;
  npiNumber?: string;
}

interface AllManagersResponse {
  allManagers: {
    allData: (UserAttributes & {
      assignedDoctors?: ManagerAssignedDoctor[];
    })[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

function mapManagerToView(
  m: UserAttributes & {
    assignedDoctors?: ManagerAssignedDoctor[];
  },
): ManagersType {
  const status = m.status?.toUpperCase();
  const displayStatus =
    status === "ACTIVE"
      ? "Active"
      : status === "INACTIVE"
        ? "Inactive"
        : status === "PENDING"
          ? "Pending"
          : m.invitationStatus === "pending"
            ? "Pending"
            : (status ?? "—");
  // API returns id as UUID string; preserve it (do not convert to number)
  const id = m.id != null && m.id !== "" ? m.id : 0;
  return {
    id,
    name:
      m.fullName ??
      ([m.firstName, m.lastName].filter(Boolean).join(" ") || "—"),
    contact: m.phoneNo ?? "—",
    email: m.email ?? "—",
    status: displayStatus,
    assignedDoctors: m.assignedDoctors?.length ?? 0,
    assignedDoctorIds:
      m.assignedDoctors?.map((d) => d.id).filter((id) => id != null) ?? [],
    imageUrl: m.imageUrl,
    revokeAccess: m.revokeAccess ?? false,
  };
}

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editUser, seteditUser] = useState<ManagersType | null>(null);
  const [showAssignDoctor, setshowAssignDoctor] = useState(false);
  const [assignDoctor, setassignDoctor] = useState<ManagersType | null>(null);
  const [togglingManagerId, setTogglingManagerId] = useState<string | number | null>(null);
  const [modifyAccessUser, { loading: modifyLoading }] =
    useMutation(MODIFY_ACCESSS_USER);

  async function handleToggleAccess(manager: ManagersType) {
    if (manager?.id == null) return;
    const revokeAccess = !manager.revokeAccess;
    setTogglingManagerId(manager.id);
    try {
      await modifyAccessUser({
        variables: {
          userId: String(manager.id),
          revokeAccess,
        },
      });
      showSuccessToast(
        revokeAccess ? "Access revoked successfully" : "Access granted successfully"
      );
      refetch();
    } catch (error) {
      console.error("Error toggling manager access:", error);
      showErrorToast("Failed to update access. Please try again.");
    } finally {
      setTogglingManagerId(null);
    }
  }

  function handleAssignDoctor(user: ManagersType) {
    console.log("user", user);
    setassignDoctor(user);
    setshowAssignDoctor(true);
  }

  function handleEdit(user: ManagersType) {
    console.log("user", user);
    seteditUser(user);
    setshowAddEditModal(true);
  }
  const [showAddEditModal, setshowAddEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;
  const router = useRouter();
  // Tab: 0 = All, 1 = Active, 2 = Pending (invites)
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");

  // Sync status label when tab changes (like Doctors page)
  useEffect(() => {
    if (selectedTabIndex === 1) setSelectedStatus("Active");
    else if (selectedTabIndex === 2) setSelectedStatus("Pending");
    else setSelectedStatus("All Status");
  }, [selectedTabIndex]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const statusVariable =
    selectedStatus === "All Status"
      ? undefined
      : (selectedStatus.toUpperCase() as "ACTIVE" | "INACTIVE" | "PENDING");

  const { data, loading, error, refetch } = useQuery<AllManagersResponse>(
    ALL_MANAGERS,
    {
      variables: {
        search: debouncedSearch || undefined,
        page: currentPage + 1,
        perPage: itemsPerPage,
        status: statusVariable,
        pendingInvites: selectedTabIndex === 2 ? true : undefined,
      },
      fetchPolicy: "network-only",
    }
  );

  const managers = useMemo(
    () => (data?.allManagers?.allData ?? []).map(mapManagerToView),
    [data]
  );
  const totalPages = data?.allManagers?.totalPages ?? 0;

  const managerStatusOptions = [
    { label: "All Status", value: "", color: "" },
    { label: "Active", value: "ACTIVE", color: "before:bg-green-500" },
    { label: "Inactive", value: "INACTIVE", color: "before:bg-red-500" },
    { label: "Pending", value: "PENDING", color: "before:bg-yellow-500" },
  ];

  const handleStatusChange = (label: string) => {
    setSelectedStatus(label);
    setCurrentPage(0);
    if (label === "Active") setSelectedTabIndex(1);
    else if (label === "Pending") setSelectedTabIndex(2);
    else setSelectedTabIndex(0);
  };

  const handleTabChange = (index: number) => {
    setSelectedTabIndex(index);
    setCurrentPage(0);
  };

  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
          Failed to load managers. Please try again.
        </div>
      </div>
    );
  }

  const showList = managers.length > 0 && !loading;
  const showEmpty = !loading && !error && managers.length === 0;

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <AdminManagersFilledIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
              fill="#2862A9"
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              Managers
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2 lg:gap-3">
          <div className="sm:bg-white rounded-full flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
            <div className="flex items-center gap-2 relative w-full p-1 sm:p-0 rounded-full bg-white sm:bg-transparent shadow-table sm:shadow-none">
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
                className="ps-8  md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-56 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
              <Menu>
                <MenuButton className="inline-flex min-w-30 whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                  {selectedStatus} <ArrowDownIcon fill="#717680" />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
                >
                  {managerStatusOptions.map((s) => (
                    <MenuItem key={s.label}>
                      <button
                        onClick={() => handleStatusChange(s.label)}
                        className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full ${
                          s.color
                            ? `before:w-1.5 before:h-1.5 before:flex-shrink-0 before:content-[''] before:rounded-full before:relative before:block ${s.color}`
                            : ""
                        }`}
                      >
                        {s.label}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
              <ThemeButton
                label="Add Manager"
                icon={<PlusIcon />}
                onClick={() => setshowAddEditModal(true)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Tabs: All / Active / Pending (like Doctors) */}
      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup selectedIndex={selectedTabIndex} onChange={handleTabChange}>
          <TabList className="flex items-center border-b bg-white rounded-t-xl mb-2 sm:mb-0 border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-4">
            {["All Managers", "Active Managers", "Pending Managers"].map(
              (tab, index) => (
                <Tab
                  key={index}
                  as="button"
                  className="flex items-center gap-1 md:gap-2 w-full justify-center hover:bg-gray-50 whitespace-nowrap md:text-base text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-1.5 py-2.5 md:py-4 md:px-6"
                >
                  {tab}
                </Tab>
              ),
            )}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-2">Assigned Doctors</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Access</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  <>
                    {managers.map((data, index) => (
                      <ManagersDatabaseView
                        key={`manager-${data.id}-${index}`}
                        user={data}
                        onEditManager={() => handleEdit(data)}
                        onAssignDoctor={() => handleAssignDoctor(data)}
                        onRowClick={() =>
                          router.push(`/admin/managers/${data.id}`)
                        }
                        onDetailsManager={() =>
                          router.push(`/admin/managers/${data.id}`)
                        }
                        hasAccess={!data.revokeAccess}
                        onToggleAccess={() => handleToggleAccess(data)}
                        toggleLoading={togglingManagerId === data.id || modifyLoading}
                      />
                    ))}
                  </>
                )}
                {showEmpty && (
                  <EmptyResult
                    title={"No managers added yet."}
                    description={
                      <p className="font-medium text-lg text-gray-800">
                        Create managers to assign doctors and monitor their
                        orders, shops, and accounting.
                      </p>
                    }
                    buttonLabel="Add Manager"
                    buttonOnClick={() => setshowAddEditModal(true)}
                    icon={<NoUserIcon />}
                  />
                )}
                {showList && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}
              </div>
            </TabPanel>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-2">Assigned Doctors</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Access</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  <>
                    {managers.map((data, index) => (
                      <ManagersDatabaseView
                        key={`manager-${data.id}-${index}`}
                        user={data}
                        onEditManager={() => handleEdit(data)}
                        onAssignDoctor={() => handleAssignDoctor(data)}
                        onRowClick={() =>
                          router.push(`/admin/managers/${data.id}`)
                        }
                        onDetailsManager={() =>
                          router.push(`/admin/managers/${data.id}`)
                        }
                        hasAccess={!data.revokeAccess}
                        onToggleAccess={() => handleToggleAccess(data)}
                        toggleLoading={togglingManagerId === data.id || modifyLoading}
                      />
                    ))}
                  </>
                )}
                {showEmpty && (
                  <EmptyResult
                    title={"No active managers."}
                    description={
                      <p className="font-medium text-lg text-gray-800">
                        Managers who have accepted their invitation appear here.
                      </p>
                    }
                    buttonLabel="Add Manager"
                    buttonOnClick={() => setshowAddEditModal(true)}
                    icon={<NoUserIcon />}
                  />
                )}
                {showList && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}
              </div>
            </TabPanel>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-2">Phone</div>
                  <div className="col-span-2">Assigned Doctors</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Access</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  <>
                    {managers.map((data, index) => (
                      <ManagersDatabaseView
                        key={`manager-${data.id}-${index}`}
                        user={data}
                        onEditManager={() => handleEdit(data)}
                        onAssignDoctor={() => handleAssignDoctor(data)}
                        onRowClick={() =>
                          router.push(`/admin/managers/${data.id}`)
                        }
                        onDetailsManager={() =>
                          router.push(`/admin/managers/${data.id}`)
                        }
                        hasAccess={!data.revokeAccess}
                        onToggleAccess={() => handleToggleAccess(data)}
                        toggleLoading={togglingManagerId === data.id || modifyLoading}
                      />
                    ))}
                  </>
                )}
                {showEmpty && (
                  <EmptyResult
                    title={"No pending invitations."}
                    description={
                      <p className="font-medium text-lg text-gray-800">
                        Managers who haven’t accepted their invitation yet
                        appear here.
                      </p>
                    }
                    buttonLabel="Add Manager"
                    buttonOnClick={() => setshowAddEditModal(true)}
                    icon={<NoUserIcon />}
                  />
                )}
                {showList && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <AssignDoctorModal
        isOpen={showAssignDoctor}
        onClose={() => {
          setshowAssignDoctor(false);
          setassignDoctor(null);
        }}
        initialvalues={assignDoctor}
        onConfirm={() => refetch()}
      />
      <AddEditManagerModal
        isOpen={showAddEditModal}
        onClose={() => {
          setshowAddEditModal(false);
          seteditUser(null);
        }}
        initialvalues={editUser}
        managerId={editUser?.id?.toString() ?? null}
        onConfirm={() => refetch()}
      />
    </div>
  );
};

export default Page;
