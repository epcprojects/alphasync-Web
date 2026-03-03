"use client";

import { ArrowDownIcon, DoctorFilledIcon, SearchIcon } from "@/icons";
import React, { useState, useEffect } from "react";
import {
  EmptyState,
  Pagination,
  Skeleton,
} from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useQuery } from "@apollo/client/react";
import DoctorListView from "@/app/components/ui/cards/DoctorListView";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ALL_DOCTORS } from "@/lib/graphql/queries";
import { UserAttributes } from "@/lib/graphql/attributes";
import { useRouter } from "next/navigation";
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";

interface AllDoctorsResponse {
  allDoctors: {
    allData: UserAttributes[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

export default function ManagerDoctorsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Sync status when switching tabs: Active tab → "Active", Pending DEA → "All Status". Don't override when on "All Doctors" (tab 0) so "Inactive" selection is preserved.
  useEffect(() => {
    if (selectedTabIndex === 1) setSelectedStatus("Active");
    else if (selectedTabIndex === 2) setSelectedStatus("All Status");
    setCurrentPage(0);
  }, [selectedTabIndex]);

  const { data, loading, error } = useQuery<AllDoctorsResponse>(ALL_DOCTORS, {
    variables: {
      search,
      status:
        selectedStatus === "All Status"
          ? undefined
          : selectedStatus.toUpperCase(),
      pendingDeaApproval: selectedTabIndex === 2 ? true : undefined,
      page: currentPage + 1,
      perPage: itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  const doctors = data?.allDoctors?.allData ?? [];
  const pageCount = data?.allDoctors?.totalPages ?? 0;

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleStatusChange = (label: string) => {
    setSelectedStatus(label);
    setCurrentPage(0);
    if (label === "Active") setSelectedTabIndex(1);
    else setSelectedTabIndex(0);
  };

  const handleDoctorClick = (doctor: UserAttributes) => {
    if (doctor?.id != null) router.push(`/manager/doctors/${doctor.id}`);
  };

  const handleViewDoctorShop = (doctor: UserAttributes) => {
    if (doctor?.id != null) router.push(`/manager/store/${doctor.id}`);
  };

  const orderStatuses = [
    { label: "All Status", value: null },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
  ];

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
          <h2 className="lg:w-full text-black font-semibold text-xl md:text-3xl">
            Doctors
          </h2>
        </div>

        <div className="sm:bg-white rounded-full flex flex-col sm:flex-row items-center gap-1 md:gap-2 sm:p-1.5 md:px-2.5 md:py-2 sm:shadow-table w-max">
          <div className="flex items-center relative bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full shadow-table sm:shadow-none">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
          <Menu>
            <MenuButton className="w-full sm:w-fit whitespace-nowrap flex justify-between py-1.5 sm:py-2 px-2 sm:px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-sm font-medium shadow-inner">
              {selectedStatus} <ArrowDownIcon fill="#717680" />
            </MenuButton>
            <MenuItems
              transition
              anchor="bottom end"
              className="min-w-40 sm:min-w-44 z-[400] origin-top-right rounded-lg bg-white shadow-lg p-1 text-sm"
            >
              {orderStatuses.map((s) => (
                <MenuItem key={s.label}>
                  <button
                    onClick={() => handleStatusChange(s.label)}
                    className="flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full"
                  >
                    {s.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList className="flex items-center border-b border-b-gray-200 gap-2 md:gap-3  md:justify-start  justify-between md:px-6">
            {["All Doctors", "Active Doctors", "Pending DEA Approvals"].map(
              (tab) => (
                <Tab
                  key={tab}
                  as="button"
                  className={
                    "flex items-center gap-1 md:gap-2 w-full justify-center text-sm hover:bg-gray-50 whitespace-nowrap md:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
                  }
                >
                  {tab}
                </Tab>
              ),
            )}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_0.5fr_0.5fr] xl:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_0.5fr] text-black font-medium text-sm px-2 py-2.5 bg-white rounded-xl shadow-table">
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
                    <h2>NPI number</h2>
                  </div>
                  <div className="xl:flex hidden">
                    <h2>Status</h2>
                  </div>
                  <div>
                    <h2>Invitation</h2>
                  </div>
                  <div className="text-center">
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
                  doctors.map((doctor: UserAttributes) => (
                    <DoctorListView
                      key={doctor.id}
                      doctor={doctor}
                      onDoctorClick={handleDoctorClick}
                      onEditDoctor={() => {}}
                      onDeleteDoctor={() => {}}
                      onResendInvitation={() => {}}
                      hideActions
                      onViewShop={handleViewDoctorShop}
                    />
                  ))
                )}
                {!doctors.length && !loading && <EmptyState />}
                {pageCount > 1 && (
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
                <div className="grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_0.5fr_0.5fr] xl:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_0.5fr] text-black font-medium text-sm px-2 py-2.5 bg-white rounded-xl shadow-table">
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
                    <h2>NPI number</h2>
                  </div>
                  <div className="xl:flex hidden">
                    <h2>Status</h2>
                  </div>
                  <div>
                    <h2>Invitation</h2>
                  </div>
                  <div className="text-center">
                    <h2>Actions</h2>
                  </div>
                </div>
                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  doctors.map((doctor: UserAttributes) => (
                    <DoctorListView
                      key={doctor.id}
                      doctor={doctor}
                      onDoctorClick={handleDoctorClick}
                      onEditDoctor={() => {}}
                      onDeleteDoctor={() => {}}
                      onResendInvitation={() => {}}
                      hideActions
                      onViewShop={handleViewDoctorShop}
                    />
                  ))
                )}
                {!doctors.length && !loading && <EmptyState />}
                {pageCount > 1 && (
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
                <div className="grid grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_0.5fr_0.5fr] xl:grid-cols-[3fr_1.5fr_1.5fr_1.5fr_2fr_1fr_1fr_0.5fr] text-black font-medium text-sm px-2 py-2.5 bg-white rounded-xl shadow-table">
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
                    <h2>NPI number</h2>
                  </div>
                  <div className="xl:flex hidden">
                    <h2>Status</h2>
                  </div>
                  <div>
                    <h2>Invitation</h2>
                  </div>
                  <div className="text-center">
                    <h2>Actions</h2>
                  </div>
                </div>
                {loading ? (
                  <div className="my-3 space-y-1">
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                    <Skeleton className="w-full h-12 rounded-full" />
                  </div>
                ) : (
                  doctors.map((doctor: UserAttributes) => (
                    <DoctorListView
                      key={doctor.id}
                      doctor={doctor}
                      onDoctorClick={handleDoctorClick}
                      onEditDoctor={() => {}}
                      onDeleteDoctor={() => {}}
                      onResendInvitation={() => {}}
                      hideActions
                      onViewShop={handleViewDoctorShop}
                    />
                  ))
                )}
                {!doctors.length && !loading && <EmptyState />}
                {pageCount > 1 && (
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
    </div>
  );
}
