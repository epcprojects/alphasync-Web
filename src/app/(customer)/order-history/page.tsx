"use client";
import {
  CrossIcon,
  EyeIcon,
  FilterIcon,
  OrderHistory,
  SearchIcon,
} from "@/icons";
import { useMutation, useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import PrescriptionOrderCard, {
  PrescriptionOrder,
} from "@/app/components/ui/cards/PrescriptionOrderCard";
import { orderfilterOptions } from "../../../../public/data/Filters";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import CustomerOrderDetails from "@/app/components/ui/modals/CustomerOrderDetails";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import { EmptyState, OrderHistorySkeleton, Pagination } from "@/app/components";
import { PATIENT_ORDERS } from "@/lib/graphql/queries";
import { REORDER_ORDER } from "@/lib/graphql/mutations";

interface PatientOrderItemData {
  id?: string | null;
  quantity?: number | null;
  price?: number | null;
  totalPrice?: number | null;
  totalTax?: number | null;
  subtotalPrice?: number | null;
  product?: {
    title?: string | null;
    description?: string | null;
    variants?:
      | {
          sku?: string | null;
        }[]
      | null;
    tags?: (string | null)[] | null;
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
  totalTax?: number | null;
  subtotalPrice?: number | null;
  hasAnotherReorder?: boolean | null;
  doctor?: {
    fullName?: string | null;
  } | null;
  orderItems?: PatientOrderItemData[] | null;
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

function History() {
  const [search, setSearch] = useState("");
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
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(
    null
  );

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

  const mapFilterToStatusVariable = (filterId: string) => {
    const filterToStatusMap: Record<string, string | undefined> = {
      all: undefined,
      processing: "paid",
      delivered: "fulfilled",
    };

    if (filterToStatusMap.hasOwnProperty(filterId)) {
      return filterToStatusMap[filterId];
    }

    return filterId.replace(/-/g, "_").toUpperCase();
  };

  const statusVariable = mapFilterToStatusVariable(selectedFilter);

  const normalizeAddress = (value?: string | null) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const {
    data: patientOrdersData,
    loading: patientOrdersLoading,
    error: patientOrdersError,
    refetch: refetchPatientOrders,
  } = useQuery<PatientOrdersResponse>(PATIENT_ORDERS, {
    variables: {
      patientId: null,
      page: Math.max(1, currentPage + 1),
      perPage: itemsPerPage,
      search: search || undefined,
      status: statusVariable ? statusVariable : "paid",
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);
  };

  const rawOrders = patientOrdersData?.patientOrders?.allData ?? [];

  const transformedOrders: PrescriptionOrder[] = rawOrders.map((order) => {
    const orderItems =
      order.orderItems?.map((item, index) => {
        const quantity = item.quantity ?? 0;
        const unitPrice = item.price ?? 0;
        const lineTotal = item.totalPrice ?? unitPrice * quantity;
        const variantsData = item.product?.variants;
        const variant =
          Array.isArray(variantsData) && variantsData.length > 0
            ? variantsData[0]
            : undefined;
        const tagsData = Array.isArray(item.product?.tags)
          ? item.product?.tags.filter(
              (tag): tag is string => typeof tag === "string"
            )
          : undefined;
        const imageData = Array.isArray(item.product?.images)
          ? item.product?.images.find(
              (image): image is string =>
                typeof image === "string" && image.trim().length > 0
            )
          : undefined;
        const primaryImage = item.product?.primaryImage
          ? String(item.product.primaryImage)
          : undefined;

        return {
          id: item.id ?? `${order.id}-${index}`,

          medicineName: item.product?.title || "Unknown Product",
          quantity,
          price: unitPrice,
          amount: `$${lineTotal.toFixed(2)}`,
          description: item.product?.description ?? undefined,
          variants: variant,
          tags: tagsData && tagsData.length > 0 ? tagsData : undefined,
          imageUrl: imageData,
          primaryImage: primaryImage ?? imageData,
        };
      }) ?? [];

    return {
      id: order.id,
      displayId: String(order.displayId ?? order.id),
      doctorName: order.doctor?.fullName || "Unknown Doctor",
      orderItems,
      orderedOn: order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : "--",
      totalPrice: order.totalPrice ?? 0,
      status: order.status ?? undefined,
      hasAnotherReorder: order.hasAnotherReorder ?? false,
      patient: order.patient
        ? {
            address: normalizeAddress(order.patient.address),
          }
        : undefined,
    };
  });

  const filteredOrders =
    selectedFilter === "all" || !statusVariable
      ? transformedOrders
      : transformedOrders.filter((order) => {
          const orderStatus = (order.status ?? "").toUpperCase();
          return orderStatus === statusVariable.toUpperCase();
        });

  const totalResults =
    patientOrdersData?.patientOrders?.count ?? filteredOrders.length;

  const pageCountFromServer = patientOrdersData?.patientOrders?.totalPages ?? 0;

  const currentItems = filteredOrders;

  const showEmptyState =
    !patientOrdersLoading && !patientOrdersError && rawOrders.length === 0;

  const showSkeleton = patientOrdersLoading && currentItems.length === 0;

  const handlePageChange = (selectedPage: number) => {
    const nextPage = Math.max(0, selectedPage);
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
  };

  const handleOrderClick = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setIsDetailModelOpen(true);
  };

  const isMobile = useIsMobile();
  const [reorderOrder] = useMutation(REORDER_ORDER);

  const handleReorder = async (order: PrescriptionOrder) => {
    if (!order?.id) return;
    try {
      setReorderingOrderId(order.id);
      await reorderOrder({
        variables: {
          orderId: order.id,
        },
      });
      await refetchPatientOrders();
      showSuccessToast("Reorder request submitted");
    } catch (error) {
      showErrorToast("Failed to submit reorder request");
      console.error("Failed to reorder order:", error);
    } finally {
      setReorderingOrderId(null);
    }
  };

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
          <h2 className="text-black font-semibold text-xl xl:text-3xl whitespace-nowrap">
            Your Order History
          </h2>
          <div className="px-3 py-1 rounded-full bg-white border border-indigo-200">
            <p className="text-base font-medium text-primary whitespace-nowrap">
              {totalResults}
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
      <div className="flex flex-col gap-4">
        {showSkeleton ? (
          <OrderHistorySkeleton />
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
              btnTitle={
                order.hasAnotherReorder
                  ? "Already submitted"
                  : reorderingOrderId === order.id
                  ? "Processing..."
                  : "Reorder"
              }
              btnDisabled={
                order.hasAnotherReorder || reorderingOrderId === order.id
              }
              onPay={handleReorder}
              onDelete={() => {
                showErrorToast("Order Cancelled");
              }}
              icon={<EyeIcon />}
              type="order"
            />
          ))
        )}
      </div>
      <div className="flex justify-center flex-col gap-2 md:gap-6 ">
        {showEmptyState && <EmptyState mtClasses="-mt-6" />}
        <Pagination
          currentPage={currentPage}
          totalPages={pageCountFromServer || 1}
          onPageChange={handlePageChange}
        />
      </div>
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
    <Suspense fallback={<OrderHistorySkeleton />}>
      <History />
    </Suspense>
  );
}
