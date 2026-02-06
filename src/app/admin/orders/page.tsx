"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { OrdersIcon, SearchIcon } from "@/icons";
import {
  EmptyState,
  Loader,
  Skeleton,
  ThemeButton,
  Pagination,
} from "@/app/components";
import OrderListView from "@/app/components/ui/cards/OrderListView";
import AdminOrderDetailCanvas from "@/app/admin/orders/AdminOrderDetailCanvas";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ADMIN_ORDERS } from "@/lib/graphql/queries";
import { EXPORT_ADMIN_ORDERS } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface OrdersResponse {
  adminOrders: {
    allData: Array<{
      id: string;
      displayId?: string | number;
      createdAt: string;
      processedAt?: string | null;
      status: string;
      myClinic?: boolean | null;
      subtotalPrice?: number | null;
      totalTax?: number | null;
      totalPrice: number;
      netCost: number | null;
      profit: number | null;
      doctor?: {
        id: string;
        email?: string | null;
        fullName?: string | null;
        imageUrl?: string | null;
      } | null;
      orderItems: Array<{
        id: string;
        quantity: number;
        price: number;
        totalPrice: number;
        product?: { id: string; title?: string | null; price?: number | null; primaryImage?: string | null } | null;
      }>;
      patient: {
        id: string;
        fullName?: string | null;
        email?: string | null;
        imageUrl?: string | null;
      } | null;
    }>;
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

/** API date is already UTC. Return date part and 12-hour time for display. */
function formatDateUtcParts(
  dateInput: string | null | undefined
): { datePart: string; timePart12h: string } | null {
  if (!dateInput) return null;
  const iso = dateInput.endsWith("Z") ? dateInput : `${dateInput.replace(/Z?$/, "")}Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const yy = String(d.getUTCFullYear()).slice(-2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const datePart = `${mm}-${dd}-${yy}`;
  const h = d.getUTCHours();
  const h12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const timePart12h = `${h12}:${min} ${ampm}`;
  return { datePart, timePart12h };
}

function OrdersContent() {
  const isMobile = useIsMobile();

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrdersResponse["adminOrders"]["allData"][0] | null>(null);

  const orderTabs = [
    { label: "Customer Orders", myClinic: false },
    { label: "Clinic Orders", myClinic: true },
  ];

  const myClinic = orderTabs[selectedTabIndex]?.myClinic;

  /** Grid template: Order ID | Customer | Doctor | Payment Date | Status | Items | Total | Net Cost | Profit | Actions */
  const adminOrdersGrid =
    "md:grid-cols-[1.5fr_2.5fr_2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_1fr]";
  /** Clinic orders: no Customer column — Order ID | Doctor | Payment Date | ... */
  const adminOrdersGridClinic =
    "md:grid-cols-[1.5fr_1.5fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_1fr]";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery<OrdersResponse>(
    ADMIN_ORDERS,
    {
      variables: {
        page: currentPage + 1,
        perPage: itemsPerPage,
        doctorId: null,
        myClinic,
        search: debouncedSearch || null,
      },
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    }
  );

  const [exportAdminOrders, { loading: exportLoading }] = useMutation(EXPORT_ADMIN_ORDERS);

  const orders = data?.adminOrders?.allData ?? [];
  const pageCount = data?.adminOrders?.totalPages ?? 0;

  useEffect(() => {
    setCurrentPage(0);
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabIndex]);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
  };

  const handleExportOrders = async () => {
    try {
      const { data } = await exportAdminOrders({
        variables: {
          doctorId: null,
          myClinic,
        },
      });

      const result = data?.exportAdminOrders;
      if (result?.success && result?.csvString) {
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + result.csvString], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const fileName = `admin-orders-${myClinic ? "clinic" : "customer"}-${new Date().toISOString().slice(0, 10)}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showSuccessToast(result.message || "Orders exported successfully!");
      } else {
        showErrorToast(result?.message || "Failed to export orders. No data received.");
      }
    } catch (e) {
      console.error("Error exporting orders:", e);
      showErrorToast("Failed to export orders. Please try again.");
    }
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex sm:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center text-primary rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <OrdersIcon
              fill="currentColor"
              height={isMobile ? "16" : "22"}
              width={isMobile ? "16" : "22"}
            />
          </span>
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-black font-semibold text-xl md:text-3xl">
              Orders
            </h2>
            {data?.adminOrders?.count !== undefined && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                {data.adminOrders.count}
              </span>
            )}
          </div>
        </div>

        <div className="sm:bg-white rounded-full w-full flex flex-col sm:flex-row items-center gap-1 md:gap-2 sm:p-1.5 md:px-2.5 md:py-2 sm:shadow-table lg:w-fit">
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

          <div className="flex items-center gap-1 md:gap-2 bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full shadow-table sm:shadow-none">
            <ThemeButton
              label="Export Orders"
              onClick={handleExportOrders}
              disabled={exportLoading}
              className="w-full sm:w-fit"
            />
          </div>
        </div>
      </div>

      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
          <TabList className="flex items-center border-b bg-white rounded-t-xl mb-2 sm:mb-0 border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-4 overflow-x-auto">
            {orderTabs.map((tab, index) => (
              <Tab
                key={tab.label}
                as="button"
                className="flex items-center gap-1 md:gap-2 w-full justify-center hover:bg-gray-50 whitespace-nowrap text-sm sm:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-1.5 py-2.5 md:py-4 md:px-6"
              >
                {tab.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {orderTabs.map((tab) => (
              <TabPanel key={tab.label}>
                <div className="space-y-1 p-0 md:p-4 pt-0">
                  <div className={`hidden md:grid ${tab.myClinic ? adminOrdersGridClinic : adminOrdersGrid} text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table`}>
                    <div>
                      <h2 className="whitespace-nowrap">Order ID</h2>
                    </div>
                    {!tab.myClinic && (
                      <div>
                        <h2>Customer</h2>
                      </div>
                    )}
                    <div>
                      <h2>Doctor</h2>
                    </div>
                    <div>
                      <h2>Payment Date</h2>
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
                      <h2 className="text-end">Actions</h2>
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
                    <>
                      {orders.map((order) => {
                        const customerName =
                          order.patient?.fullName || "Unknown Customer";
                        const doctorName = order.doctor?.fullName ?? null;
                        const isClinicOrder = tab.myClinic;
                        const customerDisplay = isClinicOrder
                          ? (doctorName ?? "—")
                          : customerName;
                        const customerEmail = isClinicOrder
                          ? null
                          : order.patient?.email ?? null;
                        const customerImageUrl = isClinicOrder
                          ? order.doctor?.imageUrl ?? null
                          : order.patient?.imageUrl ?? null;

                        return (
                          <OrderListView
                            layout="admin"
                            hideCustomer={tab.myClinic}
                            gridCols={tab.myClinic ? adminOrdersGridClinic : adminOrdersGrid}
                            onRowClick={() => setSelectedOrder(order)}
                            key={order.id}
                            order={{
                              id: parseInt(order.id),
                              orderId: order.displayId || "---",
                              displayId: order.displayId
                                ? parseInt(order.displayId.toString())
                                : parseInt(order.id),
                              customer: customerDisplay,
                              doctorName,
                              imageUrl: customerImageUrl,
                              customerEmail,
                              date: (() => {
                                const parts = formatDateUtcParts(
                                  order.processedAt || order.createdAt
                                );
                                if (!parts) return "—";
                                return (
                                  <>
                                    {parts.datePart}
                                    <br />
                                    <span className="">
                                      {parts.timePart12h}{" "}
                                      <span className="text-[10px] text-gray-500">(utc)</span>
                                    </span>
                                  </>
                                );
                              })(),
                              status: order.status,
                              items: order.orderItems.length,
                              total: order.totalPrice,
                              netCost: order.netCost ?? 0,
                              profit: order.profit ?? 0,
                            }}
                            onViewOrderDetail={() => setSelectedOrder(order)}
                          />
                        );
                      })}
                    </>
                  )}

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
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>

      <AdminOrderDetailCanvas
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <OrdersContent />
    </Suspense>
  );
}

