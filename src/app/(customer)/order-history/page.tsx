"use client";
import {
  ArrowLeftIcon,
  CrossIcon,
  DeliveryBoxIcon,
  FilterIcon,
  SearchIcon,
} from "@/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import PrescriptionOrderCard, {
  PrescriptionOrder,
} from "@/app/components/ui/cards/PrescriptionOrderCard";
import { paymentOrders } from "../../../../public/data/orders";
import { filterOptions } from "../../../../public/data/Filters";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

function PendingPayments() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(
    null
  );
  const today = new Date();
  const itemsPerPage = 9;
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);
    console.log("Selected filter:", filterId);
  };

  const toDate = (dateString: string): Date => {
    const [month, day, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1: Date, date2: Date): boolean =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const filteredOrders = paymentOrders.filter((order) => {
    if (selectedFilter === "all") return true;

    const orderDate = toDate(order.orderedOn);

    switch (selectedFilter) {
      case "due-today":
        return isSameDay(orderDate, today);

      case "due-tomorrow": {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return isSameDay(orderDate, tomorrow);
      }

      case "due-three-days": {
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return orderDate > today && orderDate <= threeDaysLater;
      }

      case "due-week": {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return orderDate >= today && orderDate <= weekEnd;
      }

      case "due-month":
        return (
          orderDate.getFullYear() === today.getFullYear() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate >= today
        );

      default:
        return true;
    }
  });

  const handleOrderClick = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setIsDetailModelOpen(true);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <DeliveryBoxIcon />
          </span>
          <h2 className="text-black font-semibold text-lg xl:text-2xl whitespace-nowrap">
            Your Order History
          </h2>
          <div className="px-3 py-1 rounded-full bg-white border border-indigo-200">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              {filteredOrders.length}
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] w-full md:w-fit">
            <div className="flex items-center relative flex-1">
              <span className="absolute left-3">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 w-full md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
            </div>
            <Menu>
              <MenuButton
                onClick={() => {
                  console.log(
                    "Toggling filter dropdown, current:",
                    showFilterDropdown
                  );
                  setShowFilterDropdown(!showFilterDropdown);
                }}
                className="w-10 h-10 md:h-10 md:w-10 outline-none bg-gray-100 cursor-pointer rounded-full flex items-center justify-center"
              >
                <FilterIcon />
              </MenuButton>

              <MenuItems
                className={
                  "absolute top-16 right-1 outline-none shadow-[0_14px_34px_0_rgba(0,0,0,0.1)] rounded-lg p-1 bg-white hidden w-48 md:block border border-gray-200 z-10"
                }
              >
                {filterOptions.map((option, index) => (
                  <MenuItem key={index}>
                    <button
                      onClick={() => handleFilterSelect(option.id)}
                      className={`w-full text-sm text-left p-2.5 my-0.5 rounded-md hover:bg-gray-50 transition-colors duration-150 ${
                        selectedFilter === option.id
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500"
                      } `}
                    >
                      <span className="block">{option.label}</span>
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
          {showFilterDropdown && (
            <div
              className="block md:hidden fixed inset-0 z-50 bg-black/40 outline-none"
              onClick={() => {
                console.log("Overlay clicked, closing modal");
                setShowFilterDropdown(false);
              }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl animate-slideUp"
                onClick={(e) => {
                  console.log("Inside white container clicked");
                  e.stopPropagation();
                }}
              >
                <div className="p-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="text-gray-500"
                  >
                    <CrossIcon fill="#000" />
                  </button>
                </div>

                <div className="flex flex-col">
                  {filterOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Mobile filter clicked:", option.id);
                        handleFilterSelect(option.id);
                      }}
                      className={`w-full text-sm text-left px-6 py-4 font-normal hover:bg-gray-50 transition-colors duration-150 ${
                        selectedFilter === option.id
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-500"
                      } `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 md:gap-4">
        <PrescriptionOrderCard
          orders={filteredOrders}
          onPress={handleOrderClick}
          btnTitle={"Reorder"}
          onPay={() => {
            showSuccessToast("Reorder Request Submitted");
          }}
          onDelete={() => {
            showErrorToast("Order Cancelled");
          }}
        />
      </div>
      {filteredOrders.length > 0 && (
        <div className="hidden md:flex justify-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel={
              <span className="flex items-center select-none font-semibold text-xs md:text-sm text-gray-600 gap-1">
                Next
                <span className="block mb-0.5 rotate-180">
                  <ArrowLeftIcon />
                </span>
              </span>
            }
            previousLabel={
              <span className="flex items-center select-none font-semibold text-xs md:text-sm text-gray-600 gap-1">
                <span className="mb-0.5">
                  <ArrowLeftIcon />
                </span>{" "}
                Previous
              </span>
            }
            // onPageChange={handlePageChange}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={itemsPerPage}
            forcePage={currentPage}
            pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer block"
            containerClassName="flex items-center relative w-full justify-center gap-2 px-4 py-3 rounded-2xl bg-white"
            pageClassName=" rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
            activeClassName="bg-gray-200 text-gray-900 font-medium"
            previousClassName="px-4 py-2 rounded-full  absolute left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
            nextClassName="px-4 py-2 rounded-full bg-gray-50  absolute end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
            breakClassName="px-3 py-1 font-semibold text-gray-400"
          />
        </div>
      )}
      <CustomerOrderDetails
        isOpen={isDetailModelOpen}
        onClose={() => setIsDetailModelOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingPayments />
    </Suspense>
  );
}
