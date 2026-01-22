"use client";

import { ArrowDownIcon, PackageIcon, PlusIcon } from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, Loader, ThemeButton, Skeleton } from "@/app/components";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import OrderListView from "@/app/components/ui/cards/OrderListView";
import Pagination from "@/app/components/ui/Pagination";
import NewOrderModal from "@/app/components/ui/modals/NewOrderModal";
import CustomerOrderPayment from "@/app/components/ui/modals/CustomerOrderPayment";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useQuery, useMutation } from "@apollo/client/react";
import { DOCTOR_ORDERS } from "@/lib/graphql/queries";
import { CREATE_ORDER, CANCEL_ORDER, EXPORT_ORDERS } from "@/lib/graphql/mutations";
import { format } from "date-fns";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useAppSelector } from "@/lib/store/hooks";
import ClinicOrderModal from "@/app/components/ui/modals/ClinicOrderModal";
import AppModal from "@/app/components/ui/modals/AppModal";

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
      totalTax: number;
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
  const user = useAppSelector((state) => state.auth.user);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isClinicOrderModalOpen, setIsClinicOrderModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string;
    displayId: string;
    doctorName: string;
    orderedOn: string;
    totalPrice: number;
    subtotalPrice: number;
    totalTax: number;
    orderItems: {
      id: string;
      medicineName: string;
      quantity: number;
      price: number;
      amount: string;
    }[];
    status?: string;
    doctorAddress?: string;
  } | null>(null);
  const orderStatuses = [
    { label: "All Status", value: null },
    { label: "Pending", value: "PENDING", color: "before:bg-red-500" },
    { label: "Canceled", value: "CANCELED", color: "before:bg-gray-600" },
    { label: "Paid", value: "PAID", color: "before:bg-green-500" },
  ];

  const [range, setRange] = useState<Selection>({
    startDate: new Date(2000, 0, 1),
    endDate: new Date(),
    key: "selection",
  });

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Tab state for All Orders/My Clinics
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // Map tab indices to myClinic values
  const orderTabs = [
    { label: "Customer Orders", myClinic: false },
    { label: "My Clinic", myClinic: true },
  ];

  // Get myClinic value from selected tab
  const myClinic = orderTabs[selectedTabIndex]?.myClinic;

  // GraphQL query to fetch orders
  const { data, loading, error, refetch } = useQuery<DoctorOrdersResponse>(
    DOCTOR_ORDERS,
    {
      variables: {
        status: selectedStatus === null ? null : selectedStatus || undefined,
        page: currentPage + 1, // GraphQL pagination is 1-based
        perPage: itemsPerPage,
        myClinic: myClinic,
      },
      fetchPolicy: "network-only",
    }
  );

  const [createOrderMutation] = useMutation(CREATE_ORDER);
  const [cancelOrderMutation, { loading: cancellingOrder }] =
    useMutation(CANCEL_ORDER);

  // GraphQL mutation to export orders
  const [exportOrders, { loading: exportLoading }] = useMutation(EXPORT_ORDERS);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{
    id: string;
    displayId: string | number;
  } | null>(null);

  const orders = data?.doctorOrders.allData || [];
  const pageCount = data?.doctorOrders.totalPages;

  const defaultRange: Selection = {
    startDate: new Date(2000, 0, 1),
    endDate: new Date(),
    key: "selection",
  };

  const isFiltered =
    selectedStatus !== null ||
    range.startDate.getTime() !== defaultRange.startDate.getTime();

  // Refetch data when tab or status changes
  useEffect(() => {
    setCurrentPage(0);
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabIndex, selectedStatus]);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
    refetch();
  };

  const handleCreateOrder = (data: {
    customer: string;
    items: { product: string; quantity: number; price: number }[];
    totalAmount: number;
  }) => {
    console.log("Final Order Data:", data);
  };

  const handleCreateClinicOrder = async (data: {
    items: {
      product: string;
      quantity: number;
      price: number;
      productId: string;
      variantId: string;
    }[];
    totalAmount: number;
  }) => {
    try {
      const orderItemsInput = data.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));

      await createOrderMutation({
        variables: {
          orderItems: orderItemsInput,
          totalPrice: data.totalAmount,
          patientId: null, // No patientId for clinic orders
          useCustomPricing: false, // No custom pricing for clinic orders
        },
      });

      showSuccessToast("Order created successfully");
      setIsClinicOrderModalOpen(false);
      await refetch();
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
  };

  const handleOrderClick = (order: (typeof orders)[0]) => {
    if (!order) {
      console.error("Order not provided");
      return;
    }

    const doctorAddress =
      user?.address ||
      (user?.street1
        ? `${user.street1}${user.street2 ? `, ${user.street2}` : ""}, ${
            user.city || ""
          }, ${user.state || ""} ${user.postalCode || ""}`.trim()
        : null);

    setSelectedOrder({
      id: order.id,
      displayId: String(order.displayId || order.id),
      doctorName: order.patient?.fullName || "Clinic Order",
      orderedOn: format(new Date(order.createdAt), "MM/dd/yyyy"),
      totalPrice: order.totalPrice,
      subtotalPrice: order.subtotalPrice,
      totalTax: order.totalTax,
      status: order.status,
      doctorAddress: doctorAddress || undefined,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        medicineName: item.product?.title || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        amount: `$${(item.price * item.quantity).toFixed(2)}`,
      })),
    });
    setIsDetailModalOpen(true);
  };

  const handlePayNow = (order: (typeof orders)[0]) => {
    if (!order) return;

    const doctorAddress =
      user?.address ||
      (user?.street1
        ? `${user.street1}${user.street2 ? `, ${user.street2}` : ""}, ${
            user.city || ""
          }, ${user.state || ""} ${user.postalCode || ""}`.trim()
        : null);

    setSelectedOrder({
      id: order.id,
      displayId: String(order.displayId || order.id),
      doctorName: order.patient?.fullName || "Clinic Order",
      orderedOn: format(new Date(order.createdAt), "MM/dd/yyyy"),
      totalPrice: order.totalPrice,
      status: order.status,
      subtotalPrice: order.subtotalPrice,
      totalTax: order.totalTax,
      doctorAddress: doctorAddress || undefined,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        medicineName: item.product?.title || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        amount: `$${(item.price * item.quantity).toFixed(2)}`,
      })),
    });
    setIsPaymentModalOpen(true);
  };

  const handleCancelClick = (order: (typeof orders)[0]) => {
    setOrderToCancel({ id: order.id, displayId: order.displayId || order.id });
    setIsCancelModalOpen(true);
  };

  const handleExportOrders = async () => {
    try {
      // Use current filter values from the page
      const { data } = await exportOrders({
        variables: {
          status: selectedStatus || null,
          patientId: null,
          myClinic: myClinic ? true : false,
        },
      });

      if (data?.exportOrders?.csvData && data?.exportOrders?.fileName) {
        // API returns base64 encoded CSV data - decode it
        let csvContent: string;
        try {
          // Decode base64 to string
          csvContent = atob(data.exportOrders.csvData);
        } catch (e) {
          console.error("Error decoding base64 CSV data:", e);
          showErrorToast("Failed to decode CSV data. Please try again.");
          return;
        }

        // Add UTF-8 BOM for Excel compatibility
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
          type: "text/csv;charset=utf-8;",
        });

        // Create a download link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          data.exportOrders.fileName || "orders.csv"
        );
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);

        showSuccessToast("Orders exported successfully!");
      } else {
        showErrorToast("Failed to export orders. No data received.");
      }
    } catch (error) {
      console.error("Error exporting orders:", error);
      showErrorToast("Failed to export orders. Please try again.");
    }
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      await cancelOrderMutation({
        variables: { orderId: orderToCancel.id },
      });
      await refetch();
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
      showSuccessToast("Order cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel order", err);
      showErrorToast("Failed to cancel order. Please try again.");
    }
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
          <div className="flex items-center w-full md:w-fit gap-1 md:gap-2 md:bg-transparent md:p-0 md:shadow-none bg-white rounded-full p-2 shadow-table">
            {/* <DateRangeSelector
              value={range}
              onApply={(next) => {
                setRange(next);
                setCurrentPage(0);
              }}
            /> */}
            <Menu>
              <MenuButton className="inline-flex whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                {orderStatuses.find((s) => s.value === selectedStatus)?.label || "All Status"} <ArrowDownIcon fill="#717680" />
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
                        setSelectedStatus(status.value);
                        setCurrentPage(0);
                        refetch();
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

            <button
              disabled={!isFiltered}
              onClick={() => {
                setSelectedStatus(null);
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
              label="Export Orders"
              onClick={handleExportOrders}
              disabled={exportLoading}
              className="w-full sm:w-fit"
            />
            <ThemeButton
              label="New Order"
              className="w-full sm:w-fit"
              icon={
                <PlusIcon
                  width={isMobile ? "16" : "20"}
                  height={isMobile ? "16" : "20"}
                />
              }
              onClick={() => {
                router.push("/orders/new-order");
              }}
              heightClass={isMobile ? "h-9" : "h-10"}
            />
          </div>
        </div>
      </div>

      {/* Tabs for All Orders/My Clinics */}
      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList className="flex items-center border-b bg-white rounded-t-xl mb-2 sm:mb-0 border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-4 overflow-x-auto">
            {orderTabs.map((tab, index) => (
              <Tab
                key={index}
                as="button"
                className="flex items-center gap-1 md:gap-2 w-full justify-center hover:bg-gray-50 whitespace-nowrap text-sm sm:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-1.5 py-2.5 md:py-4 md:px-6"
              >
                {tab.label}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden md:grid md:grid-cols-[4fr_4fr_4fr_2fr_4fr_4fr_4fr] lg:grid-cols-[1.5fr_2.5fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr] text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
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
                    {orders.map((order) => (
                      <OrderListView
                        onRowClick={() => router.push(`/orders/${order.id}`)}
                        key={order.id}
                        order={{
                          id: parseInt(order.id),
                          orderId: order.displayId || "---",
                          displayId: order.displayId
                            ? parseInt(order.displayId.toString())
                            : parseInt(order.id),
                          customer:
                            order.patient?.fullName || "Unknown Customer",
                          imageUrl: order.patient?.imageUrl,
                          customerEmail: order.patient?.email,
                          date: format(new Date(order.createdAt), "MM-dd-yy"),
                          status: order.status,
                          items: order.orderItems.length,
                          total: order.totalPrice,
                          netCost: order.netCost ?? 0,
                          profit: order.profit ?? 0,
                        }}
                        onViewOrderDetail={() =>
                          router.push(`/orders/${order.id}`)
                        }
                      />
                    ))}
                  </>
                )}
              </div>
              <div className="flex justify-center flex-col gap-2 md:gap-6 px-0 md:px-4 pb-4">
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
            </TabPanel>
            <TabPanel>
              <div className="space-y-1 p-0 md:p-4 pt-0">
                <div className="hidden md:grid md:grid-cols-[4rem_4rem_6rem_1fr_1fr_1fr_5rem]  lg:grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr_1.5fr] text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
                  <div>
                    <h2 className="whitespace-nowrap">Order ID</h2>
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
                    <h2 className="text-center">Actions</h2>
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
                    {orders.map((order) => (
                      <OrderListView
                        onRowClick={() => handleOrderClick(order)}
                        key={order.id}
                        hideCustomer={true}
                        hideProfit={true}
                        showPayNow={true}
                        onPayNow={() => handlePayNow(order)}
                        onCancelOrder={
                          !order.patient ? () => handleCancelClick(order) : undefined
                        }
                        order={{
                          id: parseInt(order.id),
                          orderId: order.displayId || "---",
                          displayId: order.displayId
                            ? parseInt(order.displayId.toString())
                            : parseInt(order.id),
                          customer:
                            order.patient?.fullName || "Unknown Customer",
                          imageUrl: order.patient?.imageUrl,
                          customerEmail: order.patient?.email,
                          date: format(new Date(order.createdAt), "MM-dd-yy"),
                          status: order.status,
                          items: order.orderItems.length,
                          total: order.totalPrice,
                          netCost: order.netCost ?? 0,
                          profit: order.profit ?? 0,
                          isClinicOrder: !order.patient,
                        }}
                        onViewOrderDetail={() => handleOrderClick(order)}
                      />
                    ))}
                  </>
                )}
              </div>
              <div className="flex justify-center flex-col gap-2 md:gap-6 px-0 md:px-4 pb-4">
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
            </TabPanel>
          </TabPanels>
        </TabGroup>
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
      <ClinicOrderModal
        isOpen={isClinicOrderModalOpen}
        onClose={() => setIsClinicOrderModalOpen(false)}
        onCreateOrder={handleCreateClinicOrder}
      />
      <AppModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        title="Cancel Order"
        subtitle=""
        onConfirm={handleConfirmCancel}
        confirmLabel={cancellingOrder ? "Cancelling..." : "Confirm Cancel"}
        confirmBtnVarient="danger"
        cancelLabel="Keep Order"
        confimBtnDisable={cancellingOrder}
        bodyPaddingClasses="p-4 md:p-6"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm md:text-base text-gray-700">
            Are you sure you want to cancel order{" "}
            {orderToCancel?.displayId ?? ""}?
          </p>
        </div>
      </AppModal>
      {selectedOrder && (
        <CustomerOrderDetails
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          type="order"
          showDoctorName={false}
        />
      )}
      {selectedOrder && isPaymentModalOpen && (
        <CustomerOrderPayment
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedOrder(null);
          }}
          order={{
            id: selectedOrder.id,
            displayId: selectedOrder.displayId,
            doctorName: selectedOrder.doctorName,
            orderedOn: selectedOrder.orderedOn,
            totalPrice: selectedOrder.totalPrice,
            subtotalPrice: selectedOrder.subtotalPrice,
            totalTax: selectedOrder.totalTax,
            orderItems: selectedOrder.orderItems.map((item) => ({
              id: item.id,
              medicineName: item.medicineName,
              quantity: item.quantity,
              price: item.price,
              amount: item.amount,
            })),
          }}
          onClick={async () => {
            setIsPaymentModalOpen(false);
            setSelectedOrder(null);
            await refetch();
            showSuccessToast("Payment processed successfully");
          }}
        />
      )}
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
