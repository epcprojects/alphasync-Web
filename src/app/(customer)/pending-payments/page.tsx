"use client";
import {
  ArrowLeftIcon,
  CrossIcon,
  DeliveryBoxIcon,
  FilterIcon,
  SearchIcon,
  TrashBinIcon,
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
import CustomerOrderPayment from "@/app/components/ui/modals/CustomerOrderPayment";
import PaymentSuccess from "@/app/components/ui/modals/PaymentSuccess";
import CustomerOrderSummary from "@/app/components/ui/modals/CustomerOrderSummary";
import { showErrorToast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import { EmptyState, Loader } from "@/app/components";

function PendingPayments() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
  const [isPaymentModelOpen, setIsPaymentModelOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(
    null
  );
  const today = new Date();
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

  const toDate = (dateString: string): Date => {
    const [month, day, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1: Date, date2: Date): boolean =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const filteredOrders = paymentOrders.filter((order) => {
    if (selectedFilter !== "all") {
      const orderDate = toDate(order.orderedOn);

      switch (selectedFilter) {
        case "due-today":
          if (!isSameDay(orderDate, today)) return false;
          break;

        case "due-tomorrow": {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          if (!isSameDay(orderDate, tomorrow)) return false;
          break;
        }

        case "due-three-days": {
          const threeDaysLater = new Date(today);
          threeDaysLater.setDate(today.getDate() + 3);
          if (!(orderDate > today && orderDate <= threeDaysLater)) return false;
          break;
        }

        case "due-week": {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          if (!(orderDate >= today && orderDate <= weekEnd)) return false;
          break;
        }

        case "due-month":
          if (
            !(
              orderDate.getFullYear() === today.getFullYear() &&
              orderDate.getMonth() === today.getMonth() &&
              orderDate >= today
            )
          )
            return false;
          break;

        default:
          break;
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
            <DeliveryBoxIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg xl:text-2xl whitespace-nowrap">
            Pending Payments
          </h2>
          <div className=" px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white border border-indigo-200">
            <p className=" text-xs md:text-sm font-medium text-primary whitespace-nowrap">
              3 Pending Order
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
                className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 w-full md:min-w-68 outline-none focus:bg-white focus:ring focus:ring-gray-200 rounded-full"
              />
            </div>
            <Menu>
              <Tooltip content="Filters">
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
        {currentItems.map((order) => (
          <PrescriptionOrderCard
            key={order.id}
            orders={[order]}
            onPress={handleOrderClick}
            btnTitle="Pay Now"
            onPay={(o) => {
              setSelectedOrder(o);
              setIsPaymentModelOpen(true);
            }}
            onDelete={() => {
              showErrorToast("Order Cancelled");
            }}
            icon={<TrashBinIcon />}
            type="Pending-page"
          />
        ))}
      </div>
      <div className="flex justify-center flex-col gap-2 md:gap-6 ">
        {currentItems.length < 1 && <EmptyState mtClasses="-mt-6" />}

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
      <CustomerOrderDetails
        isOpen={isDetailModelOpen}
        onClose={() => setIsDetailModelOpen(false)}
        order={selectedOrder}
        type="Pending-page"
      />
      {selectedOrder && isPaymentModelOpen && (
        <CustomerOrderPayment
          isOpen={isPaymentModelOpen}
          onClose={() => setIsPaymentModelOpen(false)}
          order={selectedOrder}
          onClick={() => {
            setIsPaymentModelOpen(false);
            setIsSuccess(true);
          }}
        />
      )}
      <PaymentSuccess
        isOpen={isSuccess}
        onClose={() => setIsSuccess(false)}
        viewOrder={() => {
          setIsSuccess(false);
          setIsSummaryModalOpen(true);
        }}
        btnTitle={"View Order"}
      />
      <CustomerOrderSummary
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <PendingPayments />
    </Suspense>
  );
}
