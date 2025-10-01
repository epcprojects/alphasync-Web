"use client";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  RequestFilledIcon,
  SearchIcon,
} from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { requests } from "../../../../public/data/requestsData";

import ReactPaginate from "react-paginate";
import RequestListView from "@/app/components/ui/cards/RequestListView";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import {
  EmptyState,
  Loader,
  MessageSendModal,
  RequestRejectModal,
} from "@/app/components";
import { useIsMobile } from "@/hooks/useIsMobile";

function RequestContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const orderStatuses = [
    { label: "Requested", color: "before:bg-amber-500" },
    { label: "Approved", color: "before:bg-green-500" },
    { label: "Denied", color: "before:bg-red-500" },
  ];

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const filteredProducts = requests.filter((p) => {
    const matchesSearch = p.customer
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "All Status" ? true : p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProducts.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected + 1));
    router.replace(`?${params.toString()}`);
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex md:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <RequestFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Requests
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2  md:px-2.5 md:py-2 p-1.5 shadow-table w-fit">
          <div className="flex items-center relative w-full">
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

          <Menu>
            <MenuButton className="inline-flex py-1 md:py-2 px-3 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
              {selectedStatus} <ArrowDownIcon fill="#717680" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              <MenuItem>
                <button
                  onClick={() => {
                    setSelectedStatus("All Status");
                    setCurrentPage(0);
                  }}
                  className="text-gray-500 hover:bg-gray-100 w-full py-2 px-2.5 rounded-md text-xs md:text-sm text-start"
                >
                  All Status
                </button>
              </MenuItem>
              {orderStatuses.map((status) => (
                <MenuItem key={status.label}>
                  <button
                    onClick={() => {
                      setSelectedStatus(status.label);
                      setCurrentPage(0);
                    }}
                    className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full before:w-1.5 before:h-1.5 before:flex-shrink-0 before:content-[''] before:rounded-full before:relative before:block ${status.color}`}
                  >
                    {status.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>

      <div className=" flex flex-col md:gap-6">
        <div className="flex flex-col gap-1">
          <div className="hidden sm:grid grid-cols-[1fr_14rem_1fr_1fr_160px] lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_160px] text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
            <div>
              <h2 className="whitespace-nowrap">Request ID</h2>
            </div>
            <div>
              <h2>Patient</h2>
            </div>
            <div className="lg:block hidden">
              <h2>Date</h2>
            </div>
            <div className="lg:block hidden">
              <h2>Items</h2>
            </div>
            <div>
              <h2>Total</h2>
            </div>
            <div>
              <h2>Status</h2>
            </div>
            <div>
              <h2>Actions</h2>
            </div>
          </div>

          {currentItems.map((order) => (
            <RequestListView
              onRowClick={() => router.push(`/orders/${order.requestID}`)}
              key={order.requestID}
              request={order}
              onProfileBtn={() => router.push(`/customers/${order.requestID}`)}
              onAcceptBtn={() => {
                showSuccessToast("'Patient request approved successfully.");
              }}
              onRejectBtn={() => {
                setIsRejectModalOpen(true);
              }}
              onChatBtn={() => {
                setIsChatModalOpen(true);
              }}
            />
          ))}
        </div>
        <div className="flex justify-center flex-col gap-2 md:gap-6 ">
          {currentItems.length < 1 && (
            <EmptyState mtClasses="-mt-0 md:-mt-4 " />
          )}

          <div className="w-full flex items-center justify-center">
            <ReactPaginate
              breakLabel="..."
              nextLabel={
                <span className="flex items-center justify-center h-9 md:w-full md:h-full w-9 select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                  <span className="hidden md:inline-block">Next</span>
                  <span className="block mb-0.5 rotate-180">
                    <ArrowLeftIcon />
                  </span>
                </span>
              }
              previousLabel={
                <span className="flex items-center  h-9 md:w-full md:h-full w-9 justify-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                  <span className="md:mb-0.5">
                    <ArrowLeftIcon />
                  </span>
                  <span className="hidden md:inline-block">Previous</span>
                </span>
              }
              onPageChange={handlePageChange}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pageCount ? pageCount : 1}
              forcePage={currentPage}
              pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 h-11 w-11 leading-8 text-center hover:bg-gray-100 cursor-pointer  hidden md:block"
              containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white shadow-table"
              pageClassName=" rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
              activeClassName="bg-gray-200 text-gray-900 font-medium"
              previousClassName="md:px-4 md:py-2 rounded-full  absolute left-3 md:left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
              nextClassName="md:px-4 md:py-2 rounded-full bg-gray-50  absolute end-3 md:end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
              breakClassName="px-3 py-1 font-semibold text-gray-400"
            />

            <h2 className="absolute md:hidden text-gravel font-medium text-sm">
              Page {currentPage + 1} of {pageCount}
            </h2>
          </div>
        </div>
      </div>
      <RequestRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={(reason) => {
          showErrorToast("Patient request denied.");
          console.log(reason);
        }}
        itemTitle="REQ-004"
      />

      <MessageSendModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        onConfirm={(reason) => {
          showSuccessToast(`Message send successfully to ${"Emily Chan"}`);
          console.log(reason);
        }}
        orderId="REQ-OO5"
        userName="Emily Chan"
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <RequestContent />
    </Suspense>
  );
}
