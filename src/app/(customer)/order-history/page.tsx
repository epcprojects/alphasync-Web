"use client";
import {
  ArrowLeftIcon,
  CrossIcon,
  EyeIcon,
  FilterIcon,
  OrderHistory,
  SearchIcon,
} from "@/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import ReactPaginate from "react-paginate";
import PrescriptionOrderCard, {
  PrescriptionOrder,
} from "@/app/components/ui/cards/PrescriptionOrderCard";
import { ordersHistory } from "../../../../public/data/orders";
import { orderfilterOptions } from "../../../../public/data/Filters";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";

function History() {
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
  const itemsPerPage = 10;
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
  }, [search, selectedFilter]);

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);
    console.log("Selected filter:", filterId);
  };

  const normalizeStatus = (status: string) =>
    status.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");

  const filteredOrders = ordersHistory.filter((order) => {
    if (selectedFilter !== "all") {
      if (
        selectedFilter === "delivered" ||
        selectedFilter === "processing" ||
        selectedFilter === "ready-for-pickup"
      ) {
        if (normalizeStatus(order.status) !== selectedFilter) return false;
      }
    }
    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();
      const doctorMatch = order.doctorName.toLowerCase().includes(lowerSearch);
      const medicineMatch = order.orderItems.some((item) =>
        item.medicineName.toLowerCase().includes(lowerSearch)
      );
      const orderNumberMatch = order.orderNumber
        .toLowerCase()
        .includes(lowerSearch);

      if (!doctorMatch && !medicineMatch && !orderNumberMatch) return false;
    }
    return true;
  });

  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredOrders.slice(offset, offset + itemsPerPage);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected));
    router.replace(`?${params.toString()}`);
  };

  const handleOrderClick = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setIsDetailModelOpen(true);
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <OrderHistory
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
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
          <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-table w-full md:w-fit">
            <div className="flex items-center relative flex-1">
              <span className="absolute left-3">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 w-full md:min-w-80 outline-none focus:bg-white focus:ring focus:ring-gray-200 rounded-full"
              />
            </div>
            <Menu>
              <Tooltip content="Filter by status">
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
              </Tooltip>

              <MenuItems
                className={
                  "absolute top-16 right-1 outline-none shadow-[0_14px_34px_0_rgba(0,0,0,0.1)] rounded-lg p-1 bg-white hidden w-48 md:block border border-gray-200 z-10"
                }
              >
                {orderfilterOptions.map((option, index) => (
                  <MenuItem key={index}>
                    <button
                      onClick={() => handleFilterSelect(option.id)}
                      className={`w-full text-sm text-left p-3 my-0.5 rounded-md hover:bg-gray-50 transition-colors duration-150 ${
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
                  {orderfilterOptions.map((option, index) => (
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
        {currentItems.map((order) => (
          <PrescriptionOrderCard
            key={order.id}
            orders={[order]}
            onPress={handleOrderClick}
            btnTitle={"Reorder"}
            onPay={() => {
              showSuccessToast("Reorder Request Submitted");
            }}
            onDelete={() => {
              showErrorToast("Order Cancelled");
            }}
            icon={<EyeIcon />}
            type="order"
          />
        ))}
      </div>
      {currentItems.length > 0 && (
        <div className="flex justify-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel={
              <span className="flex items-center gap-1 select-none font-semibold text-xs md:text-sm text-gray-700">
                Next
                <span className="block mb-0.5 rotate-180">
                  <ArrowLeftIcon />
                </span>
              </span>
            }
            previousLabel={
              <span className="flex items-center gap-1 select-none font-semibold text-xs md:text-sm text-gray-700">
                <span className="mb-0.5">
                  <ArrowLeftIcon />
                </span>
                Previous
              </span>
            }
            onPageChange={handlePageChange}
            pageRangeDisplayed={3}
            marginPagesDisplayed={1}
            pageCount={pageCount}
            forcePage={currentPage}
            pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer block"
            containerClassName="flex items-center relative w-full justify-center gap-2 px-4 py-3 rounded-2xl bg-white shadow-table"
            pageClassName="rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
            activeClassName="bg-gray-200 text-gray-900 font-medium"
            previousClassName="px-4 py-2 rounded-full absolute left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
            nextClassName="px-4 py-2 rounded-full bg-gray-50 absolute end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
            breakClassName="px-3 py-1 font-semibold text-gray-400"
          />
        </div>
      )}
      <CustomerOrderDetails
        isOpen={isDetailModelOpen}
        onClose={() => setIsDetailModelOpen(false)}
        order={selectedOrder}
        type="order"
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <History />
    </Suspense>
  );
}
