"use client";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeButton } from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import OrderListView from "@/app/components/ui/cards/OrderListView";
import { orders } from "../../../../public/data/OrderManagement";
import ReactPaginate from "react-paginate";
import DateRangeSelector from "@/app/components/DateRangePicker";
import NewOrderModal from "@/app/components/ui/modals/NewOrderModal";
import { useIsMobile } from "@/hooks/useIsMobile";

type Selection = {
  startDate: Date;
  endDate: Date;
  key: "selection";
};

function OrderContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const orderStatuses = [
    { label: "Delivered", color: "before:bg-green-500" },
    { label: "Processing", color: "before:bg-amber-500" },
    { label: "Pending", color: "before:bg-red-500" },
    { label: "Shipped", color: "before:bg-indigo-500" },
    { label: "Cancelled", color: "before:bg-gray-600" },
  ];

  const [range, setRange] = useState<Selection>({
    startDate: new Date(2000, 0, 1),
    endDate: new Date(),
    key: "selection",
  });
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

  const endOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOrderDate = (o: any): Date | null => {
    const raw = o.date ?? o.orderDate ?? o.createdAt;
    if (!raw) return null;
    const dt = raw instanceof Date ? raw : new Date(raw);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const rangeStart = startOfDay(range.startDate);
  const rangeEnd = endOfDay(range.endDate);

  // const fmt = (d: Date) =>
  //   d.toLocaleDateString(undefined, {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   });
  const itemsPerPage = 5;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const filteredProducts = orders.filter((p) => {
    const matchesSearch = p.customer
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "All Status" ? true : p.status === selectedStatus;

    const orderDate = getOrderDate(p);
    const matchesDate = orderDate
      ? orderDate >= rangeStart && orderDate <= rangeEnd
      : false;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProducts.slice(offset, offset + itemsPerPage);
  const defaultRange: Selection = {
    startDate: new Date(2000, 0, 1),
    endDate: new Date(),
    key: "selection",
  };
  const isFiltered =
    selectedStatus !== "All Status" ||
    range.startDate.getTime() !== defaultRange.startDate.getTime();
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

  const handleCreateOrder = (data: {
    customer: string;
    items: { product: string; quantity: number; price: number }[];
    totalAmount: number;
  }) => {
    console.log("Final Order Data:", data);
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <PackageIcon
              height={isMobile ? 16 : 20}
              width={isMobile ? 16 : 20}
              fill="currentColor"
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            All Orders
          </h2>
        </div>

        <div className="md:bg-white rounded-full flex md:flex-row flex-col w-full items-center gap-2 md:p-2  md:shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] lg:w-fit">
          <div className="flex items-center relative w-full md:shadow-none bg-white md:bg-transparent md:p-0  p-2 rounded-full shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
          <div className="flex items-center w-fit gap-1 md:gap-2 md:bg-transparent md:p-0 md:shadow-none bg-white rounded-full p-3 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
            <DateRangeSelector
              value={range}
              onApply={(next) => {
                setRange(next);
                setCurrentPage(0);
              }}
            />
            <Menu>
              <MenuButton className="inline-flex whitespace-nowrap py-1.5 md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                {selectedStatus} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
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

            <button
              disabled={!isFiltered}
              onClick={() => {
                setSelectedStatus("All Status");
                setRange({
                  startDate: new Date(2000, 0, 1),
                  endDate: new Date(),
                  key: "selection",
                });
                setCurrentPage(0);
              }}
              className="bg-gray-100 hover:bg-gray-300 rounded-full flex h-9 md:h-10 px-3 text-xs md:text-sm py-2.5 text-gray-700 md:leading-5 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200"
            >
              Clear
            </button>

            <ThemeButton
              label={"New Order"}
              icon={<PlusIcon />}
              onClick={() => {
                router.push("/orders/new-order");
              }}
              heightClass={isMobile ? "h-9" : "h-10"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="hidden md:grid md:grid-cols-[4rem_10rem_4rem_6rem_1fr_1fr_1fr_1fr_3rem]  lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_1fr_4rem] text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
          <div>
            <h2 className="whitespace-nowrap">Order ID</h2>
          </div>
          <div>
            <h2>Customer</h2>
          </div>
          <div>
            <h2>Date</h2>
          </div>
          <div>
            <h2>Status</h2>
          </div>
          <div>
            <h2>Items</h2>
          </div>
          <div>
            <h2>Total</h2>
          </div>
          <div>
            <h2 className="whitespace-nowrap">Net Cost</h2>
          </div>
          <div>
            <h2>Profit</h2>
          </div>
          <div>
            <h2 className="text-center">Actions</h2>
          </div>
        </div>

        {currentItems.map((order) => (
          <OrderListView
            onRowClick={() => router.push(`/orders/${order.orderId}`)}
            key={order.orderId}
            order={order}
            onViewCustomer={() => router.push(`/orders/${order.orderId}`)}
          />
        ))}
      </div>
      <div className="flex justify-center ">
        {currentItems.length > 0 && (
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
              pageCount={pageCount}
              forcePage={currentPage}
              pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 h-11 w-11 leading-8 text-center hover:bg-gray-100 cursor-pointer  hidden md:block"
              containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white"
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
        )}
      </div>
      <NewOrderModal
        isOpen={isOrderModalOpen}
        onCreateOrder={handleCreateOrder}
        onClose={() => setIsOrderModalOpen(false)}
        customers={[
          {
            name: "John Smith",
            displayName: "John Smith",
          },
          {
            name: "Sarah J",
            displayName: "Sarah J",
            email: "Sarah.smith@email.com",
          },
          {
            name: "Emily Chen",
            displayName: "Emily Chen",
            email: "Emily.smith@email.com",
          },
        ]}
        products={[
          {
            name: "BPC-157",
            displayName: "BPC-157",
          },
          {
            name: "TB-500",
            displayName: "TB-500",
          },
          {
            name: "CJC-1295",
            displayName: "CJC-1295",
          },
        ]}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderContent />
    </Suspense>
  );
}
