"use client";
import {
  CrossIcon,
  DeliveryBoxIcon,
  FilterIcon,
  SearchIcon,
  TrashBinIcon,
} from "@/icons";
import { useMutation, useQuery } from "@apollo/client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import PrescriptionOrderCard, {
  PrescriptionOrder,
} from "@/app/components/ui/cards/PrescriptionOrderCard";
import { filterOptions } from "../../../../public/data/Filters";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import CustomerOrderPayment from "@/app/components/ui/modals/CustomerOrderPayment";
import PaymentSuccess from "@/app/components/ui/modals/PaymentSuccess";
import CustomerOrderSummary from "@/app/components/ui/modals/CustomerOrderSummary";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import {
  EmptyState,
  Pagination,
  PendingPaymentsSkeleton,
} from "@/app/components";
import AppModal from "@/app/components/ui/modals/AppModal";
import { PATIENT_ORDERS } from "@/lib/graphql/queries";
import { CANCEL_ORDER } from "@/lib/graphql/mutations";

interface PatientOrderItemData {
  id?: string | null;
  quantity?: number | null;
  price?: number | null;
  totalPrice?: number | null;
  product?: {
    title?: string | null;
    description?: string | null;
    variants?:
      | {
          sku?: string | null;
        }[]
      | null;
    images?: (string | null)[] | null;
    primaryImage?: string | null;
  } | null;
}

interface PatientOrderData {
  id: string;
  displayId?: string | null;
  status?: string | null;
  createdAt: string;
  totalPrice?: number | null;
  orderItems?: PatientOrderItemData[] | null;
  doctor?: {
    fullName?: string | null;
  } | null;
  patient?: {
    address?: string | null;
  } | null;
}

interface PatientOrdersResponse {
  patientOrders: {
    allData: PatientOrderData[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

const normalizeAddress = (value?: string | null) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getDueLabel = (orderDate: Date, today: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const normalizedOrderDate = new Date(
    orderDate.getFullYear(),
    orderDate.getMonth(),
    orderDate.getDate()
  );
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const diffInDays = Math.round(
    (normalizedOrderDate.getTime() - normalizedToday.getTime()) / msPerDay
  );

  if (diffInDays === 0) return "Due Today";
  if (diffInDays === 1) return "Due Tomorrow";
  if (diffInDays > 1 && diffInDays <= 3) return "Due in Three Days";
  if (diffInDays > 3 && diffInDays <= 7) return "Due this Week";
  if (
    diffInDays > 7 &&
    normalizedOrderDate.getMonth() === normalizedToday.getMonth() &&
    normalizedOrderDate.getFullYear() === normalizedToday.getFullYear()
  ) {
    return "Due this month";
  }

  return diffInDays < 0 ? "Overdue" : "Upcoming";
};

function PendingPayments() {
  const [search, setSearch] = useState("");
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
  const [orderToCancel, setOrderToCancel] = useState<PrescriptionOrder | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );
  const today = new Date();
  const itemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(0);
  const {
    data: patientOrdersData,
    loading: patientOrdersLoading,
    error: patientOrdersError,
    refetch: refetchPatientOrders,
  } = useQuery<PatientOrdersResponse>(PATIENT_ORDERS, {
    variables: {
      patientId: null,
      page: currentPage + 1,
      perPage: itemsPerPage,
      search: search,
      status: "pending_payment",
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [cancelOrderMutation] = useMutation(CANCEL_ORDER);

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

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);
  };

  const toDate = (dateString: string): Date => {
    const [month, day, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1: Date, date2: Date): boolean =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const rawOrders = patientOrdersData?.patientOrders?.allData ?? [];

  const transformedOrders: PrescriptionOrder[] = rawOrders.map((order) => {
    const orderDate = order.createdAt ? new Date(order.createdAt) : null;
    const orderItems =
      order.orderItems?.map((item, index) => {
        const quantity = item.quantity ?? 0;
        const unitPrice = item.price ?? 0;
        const lineTotal = item.totalPrice ?? unitPrice * quantity;
        const imageData = Array.isArray(item.product?.images)
          ? item.product?.images.find(
              (image): image is string =>
                typeof image === "string" && image.trim().length > 0
            )
          : undefined;
        const primaryImage = item.product?.primaryImage
          ? String(item.product.primaryImage)
          : imageData;

        return {
          id: item.id ?? `${order.id}-${index}`,
          medicineName: item.product?.title || "Unknown Product",
          quantity,
          price: unitPrice,
          amount: `$${lineTotal.toFixed(2)}`,
          description: item.product?.description ?? undefined,
          product: {
            primaryImage,
          },
        };
      }) ?? [];

    return {
      id: order.id,
      displayId: String(order.displayId ?? order.id),
      doctorName: order.doctor?.fullName || "Unknown Doctor",
      orderItems,
      orderedOn: orderDate ? orderDate.toLocaleDateString("en-US") : "--",
      totalPrice: order.totalPrice ?? 0,
      isDueToday: orderDate ? getDueLabel(orderDate, today) : undefined,
      status: order.status ?? undefined,
      patient: order.patient
        ? {
            address: normalizeAddress(order.patient.address),
          }
        : undefined,
    };
  });

  const filteredOrders = transformedOrders.filter((order) => {
    if (selectedFilter !== "all") {
      if (!order.orderedOn) return false;
      const orderDate = toDate(order.orderedOn);
      if (Number.isNaN(orderDate.getTime())) return false;
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
      const displayIdMatch = order.displayId
        .toLowerCase()
        .includes(lowerSearch);

      if (!doctorMatch && !medicineMatch && !displayIdMatch) return false;
    }
    return true;
  });

  const pageCountFromServer = patientOrdersData?.patientOrders?.totalPages ?? 0;
  const currentItems = filteredOrders;
  const pendingCount = patientOrdersData?.patientOrders?.count ?? 0;
  const totalPages = pageCountFromServer > 0 ? pageCountFromServer : 1;
  const pendingCountLabel = patientOrdersLoading
    ? "Loading..."
    : `${pendingCount} Pending ${pendingCount === 1 ? "Order" : "Orders"}`;
  const showEmptyState =
    !patientOrdersLoading &&
    !patientOrdersError &&
    transformedOrders.length === 0;
  const showSkeleton = patientOrdersLoading && currentItems.length === 0;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel?.id || cancellingOrderId === orderToCancel.id) return;
    try {
      setCancellingOrderId(orderToCancel.id);
      await cancelOrderMutation({
        variables: { orderId: orderToCancel.id },
      });
      await refetchPatientOrders();
      showSuccessToast("Order cancelled");
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error("Failed to cancel order", error);
      showErrorToast("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleOpenCancelModal = (order: PrescriptionOrder) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (cancellingOrderId) return;
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
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
          <h2 className="text-black font-semibold text-xl xl:text-3xl whitespace-nowrap">
            Pending Payments
          </h2>
          <div className=" px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white border border-indigo-200">
            <p className=" text-xs md:text-sm font-medium text-primary whitespace-nowrap">
              {pendingCountLabel}
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
      <div className="flex flex-col gap-4">
        {showSkeleton ? (
          <PendingPaymentsSkeleton />
        ) : patientOrdersError ? (
          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <p className="text-sm font-medium text-red-500">
              {patientOrdersError.message}
            </p>
          </div>
        ) : (
          currentItems.map((order) => (
            <PrescriptionOrderCard
              key={order.id}
              orders={[order]}
              onPress={handleOrderClick}
              btnTitle="Pay Now"
              onPay={(o) => {
                setSelectedOrder(o);
                setIsPaymentModelOpen(true);
              }}
              onDelete={() => handleOpenCancelModal(order)}
              icon={
                cancellingOrderId === order.id ? (
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <TrashBinIcon />
                )
              }
              type="Pending-page"
            />
          ))
        )}
      </div>
      <div className="flex justify-center flex-col gap-2 md:gap-6 ">
        {/* {showEmptyState && <EmptyState mtClasses="-mt-6" />} */}
        {(!currentItems || currentItems.length === 0) && <EmptyState />}
        {!showSkeleton && currentItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
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
          onClose={() => {
            setIsPaymentModelOpen(false);
            refetchPatientOrders();
          }}
          order={selectedOrder}
          onClick={() => {
            setIsPaymentModelOpen(false);
            setIsSuccess(true);
            refetchPatientOrders();
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
      <AppModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onCancel={handleCloseCancelModal}
        title="Cancel Order"
        subtitle="This action cannot be undone"
        confirmLabel={
          cancellingOrderId && orderToCancel?.id === cancellingOrderId
            ? "Cancelling..."
            : "Confirm Cancel"
        }
        cancelLabel="Keep Order"
        confirmBtnVarient="danger"
        confimBtnDisable={
          Boolean(cancellingOrderId) && orderToCancel?.id === cancellingOrderId
        }
        disableCloseButton={
          Boolean(cancellingOrderId) && orderToCancel?.id === cancellingOrderId
        }
        outSideClickClose={
          !(
            Boolean(cancellingOrderId) &&
            orderToCancel?.id === cancellingOrderId
          )
        }
        bodyPaddingClasses="p-4 md:p-6"
        onConfirm={handleCancelOrder}
      >
        <p className="text-sm md:text-base text-gray-700">
          Are you sure you want to cancel order{" "}
          <span className="font-semibold">
            {orderToCancel?.displayId || orderToCancel?.id}
          </span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PendingPaymentsSkeleton />}>
      <PendingPayments />
    </Suspense>
  );
}
