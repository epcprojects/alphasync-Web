"use client";
import { EmptyState, Loader, ThemeButton } from "@/app/components";
import HorizontalBarChart from "@/app/components/charts/HorizontalBarChart";
import RevenueChart from "@/app/components/charts/RevenueChart";
import DateRangeSelector from "@/app/components/DateRangePicker";
import OrderListView from "@/app/components/ui/cards/OrderListView";
import { useQuery } from "@apollo/client/react";
import { DOCTOR_ORDERS } from "@/lib/graphql/queries";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  AccountFilledIcon,
  ArrowDownIcon,
  Calendar,
  CalendarDotsIcon,
  CalendarIcon,
  PackageIcon,
  SearchIcon,
} from "@/icons";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import React, { useState } from "react";
import Pagination from "@/app/components/ui/Pagination";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import PeptideOrderListView from "@/app/components/ui/cards/PeptideOrderListView";

type Selection = {
  startDate: Date;
  endDate: Date;
  key: "selection";
};
interface DoctorOrdersResponse {
  doctorOrders: {
    allData: {
      id: string;
      displayId?: string | number;
      patient: {
        email: string;
        fullName: string;
        imageUrl?: string | null;
      } | null;
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

type DateFilter = "today" | "thisMonth" | "last3Months" | "thisYear" | "custom";

const Page = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<DateFilter>("today");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 10;

  const { data, loading, error, refetch } = useQuery<DoctorOrdersResponse>(
    DOCTOR_ORDERS,
    {
      variables: {
        status: selectedStatus === "All Status" ? undefined : selectedStatus,
        page: currentPage + 1, // GraphQL pagination is 1-based
        perPage: itemsPerPage,
        myClinic: false,
      },
      fetchPolicy: "network-only",
    }
  );

  const orders = data?.doctorOrders.allData || [];
  const pageCount = data?.doctorOrders.totalPages;

  const orderStatuses = [
    { label: "Delivered", color: "before:bg-green-500" },
    { label: "Processing", color: "before:bg-amber-500" },
    { label: "Pending", color: "before:bg-red-500" },
    { label: "Shipped", color: "before:bg-indigo-500" },
    { label: "Cancelled", color: "before:bg-gray-600" },
  ];

  const isFiltered = selectedStatus !== "All Status";

  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection" as const,
  });

  const today = () => {
    const d = new Date();
    setRange({ startDate: d, endDate: d, key: "selection" });
    setActiveFilter("today");
  };

  const thisMonth = () => {
    setRange({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(),
      key: "selection",
    });
    setActiveFilter("thisMonth");
  };

  const last3Months = () => {
    setRange({
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() - 2,
        1
      ),
      endDate: new Date(),
      key: "selection",
    });
    setActiveFilter("last3Months");
  };

  const thisYear = () => {
    setRange({
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(),
      key: "selection",
    });
    setActiveFilter("thisYear");
  };

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(d);

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  const rangeLabel = (start: Date, end: Date) =>
    isSameDay(start, end) ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;

  const customLabel = rangeLabel(range.startDate, range.endDate);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
    refetch();
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex xl:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 lg:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <AccountFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black whitespace-nowrap font-semibold text-lg sm:text-2xl lg:text-3xl">
            Peptide Accounting
          </h2>
        </div>

        <div className="bg-white  rounded-full w-full flex items-center gap-1 md:gap-2 md:px-2.5 md:py-2 p-1.5 shadow-table sm:w-fit">
          <div className="hidden lg:flex items-center gap-2">
            <ThemeButton
              label="Today"
              onClick={today}
              variant={activeFilter === "today" ? "filled" : "gray"}
              className="w-full sm:w-fit"
              heightClass={isMobile ? "h-9" : "h-10"}
              size={isMobile ? "small" : "medium"}
            />

            <ThemeButton
              label="This Month"
              onClick={thisMonth}
              variant={activeFilter === "thisMonth" ? "filled" : "gray"}
              className="w-full sm:w-fit"
              heightClass={isMobile ? "h-9" : "h-10"}
              size={isMobile ? "small" : "medium"}
            />

            <ThemeButton
              label="Last 3 Months"
              onClick={last3Months}
              variant={activeFilter === "last3Months" ? "filled" : "gray"}
              className="w-full sm:w-fit"
              heightClass={isMobile ? "h-9" : "h-10"}
              size={isMobile ? "small" : "medium"}
            />

            <ThemeButton
              label="This Year"
              onClick={thisYear}
              variant={activeFilter === "thisYear" ? "filled" : "gray"}
              className="w-full sm:w-fit"
              heightClass={isMobile ? "h-9" : "h-10"}
              size={isMobile ? "small" : "medium"}
            />
          </div>

          <Menu>
            <MenuButton className="inline-flex sm:hidden whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-semibold  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
              Filter <ArrowDownIcon fill="#717680" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`!max-w-32 w-fit md:min-w-44 ms-2 z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              <MenuItem>
                <button
                  onClick={today}
                  className="text-gray-500 hover:bg-gray-100 w-full py-2 px-2.5 rounded-md text-xs md:text-sm text-start"
                >
                  Today
                </button>
              </MenuItem>

              <MenuItem>
                <button
                  onClick={thisMonth}
                  className="text-gray-500 hover:bg-gray-100 w-full py-2 px-2.5 rounded-md text-xs md:text-sm text-start"
                >
                  This Month
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={last3Months}
                  className="text-gray-500 hover:bg-gray-100 w-full py-2 px-2.5 rounded-md text-xs md:text-sm text-start"
                >
                  Last 3 Months
                </button>
              </MenuItem>
              <MenuItem>
                <button
                  onClick={thisYear}
                  className="text-gray-500 hover:bg-gray-100 w-full py-2 px-2.5 rounded-md text-xs md:text-sm text-start"
                >
                  This Year
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>

          <DateRangeSelector
            value={range}
            onChange={(next) => {
              setRange(next);
              setActiveFilter("custom");
            }}
            showLabel={true}
            label={activeFilter === "custom" ? customLabel : "Custom Range"}
            active={activeFilter === "custom"}
          />
        </div>
      </div>

      <div className="text-sm hidden">
        <div>
          <b>Applied:</b> {range.startDate.toDateString()} –{" "}
          {range.endDate.toDateString()}
        </div>
      </div>

      <div className=" grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl">
          <div className="flex items-center justify-between flex-wrap w-full pt-5 px-5">
            <h2 className="text-xl text-black font-medium ">
              Revenue & Profit Trends
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-1.25 h-1.25 bg-primary inline-block  rounded-full "></span>
                <span className="text-sm">Revenue</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-1.25 h-1.25 bg-green-600 inline-block  rounded-full "></span>
                <span className="text-sm">Profit</span>
              </div>
            </div>
          </div>

          <RevenueChart
            categories={[
              "Oct 26",
              "Nov 2",
              "Nov 9",
              "Nov 16",
              "Nov 23",
              "Nov 30",
              "Dec 7",
              "Dec 14",
              "Dec 21",
              "Dec 28",
            ]}
            series={[
              {
                name: "Revenue",
                data: [
                  6800, 7100, 7400, 7700, 8200, 7600, 8600, 8800, 8500, 9200,
                ],
              },
              {
                name: "Profit",
                data: [
                  4500, 4700, 4900, 5100, 5400, 5000, 5500, 5600, 5400, 6000,
                ],
              },
            ]}
          />
        </div>

        <div className="bg-white rounded-2xl">
          <div className="flex items-center justify-between w-full pt-5 px-5">
            <h2 className="text-xl text-black font-medium ">
              Top Peptides by Profit
            </h2>
          </div>
          <div className="px-5">
            <HorizontalBarChart
              categories={[
                "AOD-9604",
                "Epithalon",
                "GHRP-6",
                "Sermorelin",
                "Thymosin Alpha-1s",
                "GHK-Cu",
              ]}
              data={[3900, 3600, 3250, 2700, 2200, 1800]}
              height={320}
            />
          </div>
        </div>
      </div>

      <div className="flex sm:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 lg:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <PackageIcon
              height={isMobile ? 16 : 20}
              width={isMobile ? 16 : 20}
              fill="currentColor"
            />
          </span>
          <h2 className="text-black whitespace-nowrap font-semibold text-lg sm:text-2xl lg:text-3xl">
            Recent Orders
          </h2>
        </div>

        <div className="bg-white rounded-full flex flex-row w-full items-center gap-2 p-1 md:p-2  shadow-table sm:w-fit">
          <div className="flex items-center relative w-full md:shadow-none rounded-full">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 h-full py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
          <div className="flex items-center  gap-1 md:gap-2 md:bg-transparent md:shadow-none rounded-full">
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
                // refetch();
              }}
              className="bg-gray-100 hover:bg-gray-300 rounded-full hidden sm:flex h-9 md:h-10 px-3 text-xs md:text-sm py-2.5 text-gray-700 md:leading-5 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="hidden md:grid md:grid-cols-[5rem_5rem_1fr_1fr_3rem_3rem_3rem_1fr] lg:grid-cols-[8rem_6rem_1fr_1fr_1fr_1fr_1fr_1fr_5rem_7rem] text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
          <div>
            <h2 className="whitespace-nowrap">Order #</h2>
          </div>
          <div>
            <h2>Date</h2>
          </div>
          <div>
            <h2>Peptide</h2>
          </div>
          <div>
            <h2>Customer</h2>
          </div>
          <div>
            <h2>Qty</h2>
          </div>
          <div className="hidden lg:block">
            <h2>Base Price</h2>
          </div>
          <div className="hidden lg:block">
            <h2 className="whitespace-nowrap">Mark-up</h2>
          </div>
          <div>
            <h2>Net Profit</h2>
          </div>
          <div>
            <h2>Total</h2>
          </div>
          <div>
            <h2 className="text-center">Status</h2>
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
            <PeptideOrderListView
              onRowClick={() => router.push(`/orders/${order.id}`)}
              key={order.id}
              order={{
                id: parseInt(order.id),
                orderId: order.displayId || "---",
                displayId: order.displayId
                  ? parseInt(order.displayId.toString())
                  : parseInt(order.id),
                customer: order.patient?.fullName || "Unknown Customer",
                imageUrl: order.patient?.imageUrl,
                customerEmail: order.patient?.email,
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
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
