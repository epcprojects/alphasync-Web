"use client";
import {
  CrossIcon,
  DeliveryBoxIcon,
  EyeIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import { useMutation, useQuery } from "@apollo/client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import PrescriptionOrderCard, {
  PrescriptionOrder,
} from "@/app/components/ui/cards/PrescriptionOrderCard";
import { filterOptions } from "../../../../public/data/Filters";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import {
  EmptyState,
  Pagination,
  PendingPaymentsSkeleton,
  ThemeButton,
} from "@/app/components";
import { DOCTOR_ORDERS } from "@/lib/graphql/queries";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import ClinicOrderModal from "@/app/components/ui/modals/ClinicOrderModal";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import CustomerOrderPayment from "@/app/components/ui/modals/CustomerOrderPayment";
import { useAppSelector } from "@/lib/store/hooks";

interface DoctorOrderItemData {
  id?: string | null;
  quantity?: number | null;
  price?: number | null;
  product?: {
    title?: string | null;
  } | null;
}

interface DoctorOrderData {
  id: string;
  displayId?: string | null;
  status?: string | null;
  createdAt: string;
  totalPrice?: number | null;
  orderItems?: DoctorOrderItemData[] | null;
  patient?: {
    fullName?: string | null;
    email?: string | null;
  } | null;
}

interface DoctorOrdersResponse {
  doctorOrders: {
    allData: DoctorOrderData[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

const toDate = (dateString: string): Date => {
  const [month, day, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const isSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

function ClinicContent() {
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(
    null
  );
  const today = new Date();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);

  const {
    data: doctorOrdersData,
    loading: doctorOrdersLoading,
    error: doctorOrdersError,
    refetch: refetchDoctorOrders,
  } = useQuery<DoctorOrdersResponse>(DOCTOR_ORDERS, {
    variables: {
      page: currentPage + 1,
      perPage: itemsPerPage,
      myClinic: true,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [createOrderMutation] = useMutation(CREATE_ORDER);

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

  const rawOrders = doctorOrdersData?.doctorOrders?.allData ?? [];

  const transformedOrders: PrescriptionOrder[] = rawOrders.map((order) => {
    const orderDate = order.createdAt ? new Date(order.createdAt) : null;
    const orderItems =
      order.orderItems?.map((item, index) => {
        const quantity = item.quantity ?? 0;
        const unitPrice = item.price ?? 0;

        return {
          id: item.id ?? `${order.id}-${index}`,
          medicineName: item.product?.title || "Unknown Product",
          quantity,
          price: unitPrice,
          amount: `$${(unitPrice * quantity).toFixed(2)}`,
        };
      }) ?? [];

    // Get doctor's address from user store
    const doctorAddress =
      user?.address ||
      (user?.street1
        ? `${user.street1}${user.street2 ? `, ${user.street2}` : ""}, ${
            user.city || ""
          }, ${user.state || ""} ${user.postalCode || ""}`.trim()
        : null);

    return {
      id: order.id,
      displayId: String(order.displayId ?? order.id),
      doctorName: order.patient?.fullName || "Clinic Order",
      orderItems,
      orderedOn: orderDate ? orderDate.toLocaleDateString("en-US") : "--",
      totalPrice: order.totalPrice ?? 0,
      status: order.status ?? undefined,
      doctorAddress: doctorAddress || undefined,
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

  const pageCountFromServer = doctorOrdersData?.doctorOrders?.totalPages ?? 0;
  const currentItems = filteredOrders;
  const clinicCount = doctorOrdersData?.doctorOrders?.count ?? 0;
  const totalPages = pageCountFromServer > 0 ? pageCountFromServer : 1;
  const clinicCountLabel = doctorOrdersLoading
    ? "Loading..."
    : `${clinicCount} ${clinicCount === 1 ? "Order" : "Orders"}`;
  const showEmptyState =
    !doctorOrdersLoading &&
    !doctorOrdersError &&
    transformedOrders.length === 0;
  const showSkeleton = doctorOrdersLoading && currentItems.length === 0;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleOrderClick = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handlePayNow = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleCreateOrder = async (data: {
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
      setIsNewOrderModalOpen(false);
      await refetchDoctorOrders();
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
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
            Clinic
          </h2>
          <div className=" px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white border border-indigo-200">
            <p className=" text-xs md:text-sm font-medium text-primary whitespace-nowrap">
              {clinicCountLabel}
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
                  ref={buttonRef}
                  onClick={() => {
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
            <ThemeButton
              label="New Order"
              onClick={() => setIsNewOrderModalOpen(true)}
              icon={<PlusIcon height="16" width="16" />}
              variant="filled"
              size="medium"
              heightClass="h-10"
            />
          </div>
          {showFilterDropdown && (
            <div
              className="block md:hidden fixed inset-0 z-50 bg-black/40 outline-none"
              onClick={() => {
                setShowFilterDropdown(false);
              }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl animate-slideUp"
                onClick={(e) => {
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
        ) : doctorOrdersError ? (
          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <p className="text-sm font-medium text-red-500">
              {doctorOrdersError.message}
            </p>
          </div>
        ) : (
          currentItems.map((order) => (
            <PrescriptionOrderCard
              key={order.id}
              orders={[order]}
              onPress={handleOrderClick}
              btnTitle={order.status === "pending_payment" ? "Pay Now" : ""}
              onPay={
                order.status === "pending_payment" ? handlePayNow : undefined
              }
              icon={<EyeIcon />}
              type="order"
            />
          ))
        )}
      </div>
      <div className="flex justify-center flex-col gap-2 md:gap-6 ">
        {(!currentItems || currentItems.length === 0) && <EmptyState />}
        {!showSkeleton && currentItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      <ClinicOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
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
            await refetchDoctorOrders();
            showSuccessToast("Payment processed successfully");
          }}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<PendingPaymentsSkeleton />}>
      <ClinicContent />
    </Suspense>
  );
}
