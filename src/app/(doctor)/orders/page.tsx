"use client";

import { ArrowDownIcon, ArrowLeftIcon, PackageIcon, PlusIcon } from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState, Loader, ThemeButton } from "@/app/components";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import OrderListView from "@/app/components/ui/cards/OrderListView";
import ReactPaginate from "react-paginate";
import NewOrderModal from "@/app/components/ui/modals/NewOrderModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useQuery } from "@apollo/client/react";
import { DOCTOR_ORDERS } from "@/lib/graphql/queries";
import { format } from "date-fns";

type Selection = {
  startDate: Date;
  endDate: Date;
  key: "selection";
};

// Interface for GraphQL response
interface DoctorOrdersResponse {
  doctorOrders: {
    allData: {
      id: string;
      displayId?: string | number;
      patient: {
        email: string;
        fullName: string;
      };
      createdAt: string;
      status: string;
      orderItems: {
        id: string;
        quantity: number;
        price: number;
        product: {
          title: string;
        };
      }[];
      totalPrice: number;
      subtotalPrice: number;
      netCost: number | null;
      profit: number | null;
    }[];
    count: number;
    nextPage: number;
    prevPage: number;
    totalPages: number;
  };
}

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

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // GraphQL query to fetch orders
  const { data, loading, error, refetch } = useQuery<DoctorOrdersResponse>(
    DOCTOR_ORDERS,
    {
      variables: {
        status: selectedStatus === "All Status" ? undefined : selectedStatus,
        page: currentPage + 1, // GraphQL pagination is 1-based
        perPage: itemsPerPage,
      },
      fetchPolicy: "network-only",
    }
  );

  const orders = data?.doctorOrders.allData || [];
  const pageCount = data?.doctorOrders.totalPages;

  const defaultRange: Selection = {
    startDate: new Date(2000, 0, 1),
    endDate: new Date(),
    key: "selection",
  };

  const isFiltered =
    selectedStatus !== "All Status" ||
    range.startDate.getTime() !== defaultRange.startDate.getTime();

  // Refetch data when search, status, or page changes
  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Remove page parameter for first page
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : "/orders");
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedStatus]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    if (selected === 0) {
      params.delete("page"); // Remove page parameter for first page
    } else {
      params.set("page", String(selected + 1));
    }
    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : "/orders");
    refetch();
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
      <div className="flex sm:flex-row flex-col lg:items-center justify-between gap-3">
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

        <div className="md:bg-white rounded-full flex md:flex-row flex-col w-full items-center gap-2 md:p-2  md:shadow-table sm:w-fit">
          {/* <div className="flex items-center relative w-full md:shadow-none bg-white md:bg-transparent md:p-0  p-2 rounded-full shadow-table">
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
          </div> */}
          <div className="flex items-center w-fit gap-1 md:gap-2 md:bg-transparent md:p-0 md:shadow-none bg-white rounded-full p-2 w-full shadow-table">
            {/* <DateRangeSelector
              value={range}
              onApply={(next) => {
                setRange(next);
                setCurrentPage(0);
              }}
            /> */}
            <Menu>
              <MenuButton className="inline-flex whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
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
                      refetch();
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
                        refetch();
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
                refetch();
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
        <div className="hidden md:grid md:grid-cols-[4rem_10rem_4rem_6rem_1fr_1fr_1fr_1fr_3rem]  lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_1fr_4rem] text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
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

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">{error.message}</div>
          </div>
        ) : (
          orders.map((order) => (
            <OrderListView
              onRowClick={() => router.push(`/orders/${order.id}`)}
              key={order.id}
              order={{
                id: parseInt(order.id),
                orderId: order.displayId || "---",
                displayId: order.displayId
                  ? parseInt(order.displayId.toString())
                  : parseInt(order.id),
                customer: order.patient.fullName,

                date: format(new Date(order.createdAt), "MM-dd-yy"),
                status: order.status,
                items: order.orderItems.length,
                total: order.totalPrice,
                netCost: order.netCost ?? 0,
                profit: order.profit ?? 0,
              }}
              onViewOrderDetail={() => router.push(`/orders/${order.id}`)}
            />
          ))
        )}
      </div>
      <div className="flex justify-center flex-col gap-2 md:gap-6 ">
        {!loading && !error && orders.length < 1 && (
          <EmptyState mtClasses=" -mt-3 md:-mt-4" />
        )}

        {!loading && !error && (pageCount || 0) > 1 && (
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
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <OrderContent />
    </Suspense>
  );
}
