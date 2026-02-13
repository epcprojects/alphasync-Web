
"use client";
import { EmptyState, ThemeButton, Skeleton } from "@/app/components";
import HorizontalBarChart from "@/app/components/charts/HorizontalBarChart";
import RevenueChart from "@/app/components/charts/RevenueChart";
import DateRangeSelector from "@/app/components/DateRangePicker";
import { useQuery } from "@apollo/client/react";
import {
  DOCTOR_ORDERS_ALL,
  PEPTIDE_ACCOUNTING_CHARTS,
} from "@/lib/graphql/queries";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  AccountFilledIcon,
  ArrowDownIcon,
  PackageIcon,
  SearchIcon,
} from "@/icons";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import React, { useEffect, useMemo, useState } from "react";
import Pagination from "@/app/components/ui/Pagination";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import PeptideOrderListView from "@/app/components/ui/cards/PeptideOrderListView";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import { useAppSelector } from "@/lib/store/hooks";

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
        tieredPrice?: number | null;
        product: {
          title: string;
          price?: number | null;
        };
      }[];
      totalPrice: number;
      subtotalPrice: number;
      totalTax?: number | null;
      netCost: number | null;
      profit: number | null;
    }[];
    count: number;
    nextPage: number;
    prevPage: number;
    totalPages: number;
  };
}

interface PeptideAccountingChartsResponse {
  peptideAccountingCharts: {
    revenueProfitTrends: {
      date: string;
      label: string;
      profit: number;
      revenue: number;
    }[];
    topPeptidesByProfit: {
      productId: string;
      productName: string;
      profit: number;
    }[];
  };
}

type DateFilter = "today" | "thisMonth" | "last3Months" | "thisYear" | "custom";

type ClinicOrderDetails = {
  id: string;
  displayId: string;
  doctorName: string;
  orderedOn: string;
  totalPrice: number;
  subtotalPrice?: number | null;
  totalTax?: number | null;
  orderItems: {
    id: string;
    medicineName: string;
    quantity: number;
    price: number;
    amount: string;
    product?: { price?: number | null } | null;
    tieredPrice?: number | null;
  }[];
  status?: string;
  doctorAddress?: string | null;
};

const Page = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [activeFilter, setActiveFilter] = useState<DateFilter>("last3Months");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isClinicDetailOpen, setIsClinicDetailOpen] = useState(false);
  const [selectedClinicOrder, setSelectedClinicOrder] =
    useState<ClinicOrderDetails | null>(null);
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection" as const,
  });

  const itemsPerPage = 10;

  const paidOnlyStatus = "PAID" as const;

  // Map DateFilter to TimeRangeEnum
  const getTimeRangeEnum = (filter: DateFilter): string => {
    switch (filter) {
      case "today":
        return "today";
      case "thisMonth":
        return "this_month";
      case "last3Months":
        return "last_3_months";
      case "thisYear":
        return "this_year";
      case "custom":
        return "custom";
      default:
        return "today";
    }
  };

  // Memoize orders query variables to prevent unnecessary refetches
  const ordersVariables = useMemo(
    () => ({
      // Accounting should only show PAID orders (clinic + customer).
      status: paidOnlyStatus,
      page: currentPage + 1, // GraphQL pagination is 1-based
      perPage: itemsPerPage,
    }),
    [paidOnlyStatus, currentPage, itemsPerPage]
  );

  const { data, loading, error, refetch } = useQuery<DoctorOrdersResponse>(
    DOCTOR_ORDERS_ALL,
    {
      variables: ordersVariables,
      fetchPolicy: "network-only",
    }
  );

  // Memoize query variables to prevent unnecessary refetches
  const chartVariables = useMemo(
    () => ({
      timeRange: getTimeRangeEnum(activeFilter),
      startDate:
        activeFilter === "custom"
          ? range.startDate.toISOString()
          : undefined,
      endDate:
        activeFilter === "custom" ? range.endDate.toISOString() : undefined,
    }),
    [activeFilter, range.startDate, range.endDate]
  );

  const {
    data: chartsData,
    loading: chartsLoading,
    error: chartsError,
  } = useQuery<PeptideAccountingChartsResponse>(PEPTIDE_ACCOUNTING_CHARTS, {
    variables: chartVariables,
    fetchPolicy: "network-only",
  });

  const pageCount = data?.doctorOrders?.totalPages ?? 0;

  // Filter orders by search term (client-side filtering)
  const orders = useMemo(() => {
    const allOrders = data?.doctorOrders.allData || [];
    if (!search.trim()) {
      return allOrders;
    }
    const searchLower = search.toLowerCase();
    return allOrders.filter(
      (order) =>
        order.displayId?.toString().toLowerCase().includes(searchLower) ||
        order.patient?.fullName?.toLowerCase().includes(searchLower) ||
        order.patient?.email?.toLowerCase().includes(searchLower) ||
        order.orderItems.some((item) =>
          item.product?.title?.toLowerCase().includes(searchLower)
        )
    );
  }, [data?.doctorOrders.allData, search]);

  // Refetch orders when page changes
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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
  const orderStatuses = [
    { label: "All Status", value: "" ,color:"" },
    { label: "Delivered", value: "DELIVERED" ,color:"before:bg-green-700"},
    { label: "paid", value: "PAID" ,color:"before:bg-green-700"},
    { label: "Processing", value: "PROCESSING" ,color:"before:bg-amber-700"},
    { label: "Pending", value: "PENDING" ,color:"before:bg-red-700"},
    { label: "pending_payment", value: "pending_payment" ,color:"before:bg-orange-700"},
    { label: "Shipped", value: "SHIPPED" ,color:"before:bg-indigo-700"},
    { label: "cancelled", value: "cancelled" ,color:"before:bg-gray-700"},
    { label: "canceled", value: "canceled" ,color:"before:bg-red-700"},
  ];
  const [orderStatus, setorderStatus] = useState("");
  const customLabel = rangeLabel(range.startDate, range.endDate);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
  };

  const openClinicOrderDetails = (order: DoctorOrdersResponse["doctorOrders"]["allData"][0]) => {
    const doctorAddress =
      user?.address ||
      (user?.street1
        ? `${user.street1}${user.street2 ? `, ${user.street2}` : ""}, ${
            user.city || ""
          }, ${user.state || ""} ${user.postalCode || ""}`.trim()
        : null);

    setSelectedClinicOrder({
      id: order.id,
      displayId: String(order.displayId || order.id),
      doctorName: order.patient?.fullName || "Clinic Order",
      orderedOn: format(new Date(order.createdAt), "MM/dd/yyyy"),
      totalPrice: order.totalPrice,
      subtotalPrice: order.subtotalPrice,
      totalTax: order.totalTax ?? undefined,
      status: order.status,
      doctorAddress: doctorAddress || undefined,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        medicineName: item.product?.title || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        amount: `$${(item.price * item.quantity).toFixed(2)}`,
        product: {
          price: item.product?.price ?? null,
        },
        tieredPrice: item.tieredPrice ?? null,
      })),
    });
    setIsClinicDetailOpen(true);
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

          {chartsError ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-red-500 text-sm">
                {chartsError.message}
              </div>
            </div>
          ) : chartsLoading ? (
            <div className="px-5 pb-5">
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
            </div>
          ) : chartsData?.peptideAccountingCharts ? (
            <RevenueChart
              categories={
                chartsData.peptideAccountingCharts.revenueProfitTrends.map(
                  (item) => item.label
                )
              }
              series={[
                {
                  name: "Revenue",
                  data: chartsData.peptideAccountingCharts.revenueProfitTrends.map(
                    (item) => item.revenue
                  ),
                },
                {
                  name: "Profit",
                  data: chartsData.peptideAccountingCharts.revenueProfitTrends.map(
                    (item) => item.profit
                  ),
                },
              ]}
            />
          ) : (
            <RevenueChart
              categories={[]}
              series={[
                { name: "Revenue", data: [] },
                { name: "Profit", data: [] },
              ]}
            />
          )}
        </div>

        <div className="bg-white rounded-2xl">
          <div className="flex items-center justify-between w-full pt-5 px-5">
            <h2 className="text-xl text-black font-medium ">
              Top Peptides by Profit
            </h2>
          </div>
          <div className="px-5">
            {chartsError ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-red-500 text-sm">
                  {chartsError.message}
                </div>
              </div>
            ) : chartsLoading ? (
             
              <>
               <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              <Skeleton className="w-full h-[20px] rounded-lg mb-2" />
              </>
            ) : chartsData?.peptideAccountingCharts ? (
              <HorizontalBarChart
                categories={chartsData.peptideAccountingCharts.topPeptidesByProfit.map(
                  (item) => item.productName
                )}
                data={chartsData.peptideAccountingCharts.topPeptidesByProfit.map(
                  (item) => item.profit
                )}
                height={320}
              />
            ) : (
              <HorizontalBarChart categories={[]} data={[]} height={320} />
            )}
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
            {data?.doctorOrders.count ? (
              <span className="text-primary border border-gray-1000 rounded-full px-2 py-0.5 font-medium">
                {data.doctorOrders.count}
              </span>
            ) : null}
         
        </div>
         <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2 lg:gap-3">
         
          <div className="sm:bg-white rounded-full  flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
            <div className="flex items-center relative w-full gap-2 p-1 sm:p-0 rounded-full bg-white sm:bg-transparent shadow-table sm:shadow-none">
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
                className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5  text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-56 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
              <Menu>
              <MenuButton className="inline-flex min-w-30 whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                  {orderStatus || "All Status"} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {orderStatuses.map((status) => (
                                  <MenuItem key={status.label}>
                                    <button
                                      onClick={() => {
                                        setorderStatus(status.value);

                                      }}
                                      className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full ${
                                        status.color ? `before:w-1.5 before:h-1.5 before:flex-shrink-0 before:content-[''] before:rounded-full before:relative before:block ${status.color}` : ""
                                      }`}
                                    >
                                      {status.label}
                                    </button>
                                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>

            </div>

          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="hidden md:grid md:grid-cols-[5rem_5rem_2fr_1fr_3rem_3rem_1fr_1fr] lg:grid-cols-[8rem_5rem_3fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
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
          <div>
            <h2>Mark-Up</h2>
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

        {error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">{error.message}</div>
          </div>
        ) : loading ? (
          <div className="my-3 space-y-1">
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="w-full h-12 rounded-full" />
          </div>
        ) : (
          orders.map((order) => (
            <PeptideOrderListView
                  onRowClick={() => {
                      if (!order.patient) {
                          openClinicOrderDetails(order);
                          return;
                      }
                      router.push(`/orders/${order.id}`);
                  } }
                  key={order.id}
                  order={{
                      id: parseInt(order.id),
                      orderId: order.displayId || "---",
                      displayId: order.displayId
                          ? parseInt(order.displayId.toString())
                          : parseInt(order.id),
                      customer: order.patient?.fullName || "Clinic Order",
                      imageUrl: order.patient?.imageUrl,
                      customerEmail: order.patient?.email,
                      date: format(new Date(order.createdAt), "MM-dd-yy"),
                      status: order.status,
                      items: order.orderItems.length,
                      total: order.totalPrice,
                      netCost: order.netCost ?? 0,
                      profit: order.profit ?? 0,
                      orderItems: order.orderItems,
                  }} isShowMarkup ={true}         />
          ))
        )}
      </div>
      <div className="flex justify-center flex-col gap-2 md:gap-6 ">
        {!loading && !error && orders.length < 1 && (
          <EmptyState mtClasses=" -mt-3 md:-mt-4" />
        )}

        {!loading && !error && pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <CustomerOrderDetails
        isOpen={isClinicDetailOpen}
        onClose={() => {
          setIsClinicDetailOpen(false);
          setSelectedClinicOrder(null);
        }}
        order={selectedClinicOrder}
        type="order"
        showDoctorName={false}
      />
    </div>
  );
};

export default Page;

