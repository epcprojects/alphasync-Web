"use client";
import { ThemeButton } from "@/app/components";
import CustomerInfoCard from "@/app/components/ui/cards/CustomerInfoCard";
import { getStatusClasses } from "@/app/components/ui/cards/OrderListView";
import {
  ArrowDownIcon,
  CrossIcon,
  DeliveryTruckIcon,
  LocationIcon,
  MessageOutgoingIcon,
  PrinterIcon,
  ShipmentTrackingIcon,
} from "@/icons";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useQuery } from "@apollo/client";
import { FETCH_ORDER } from "@/lib/graphql/queries";
import { UserAttributes } from "@/lib/graphql/attributes";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product: {
    id: string;
    title: string;
    variants: {
      id: string;
      price: number;
      shopifyVariantId: string;
    }[];
  };
}

interface FetchOrderResponse {
  fetchOrder: {
    id: string;
    createdAt: string;
    status: string;
    subtotalPrice: number;
    totalPrice: number;
    totalTax: number;
    patient: UserAttributes;
    orderItems: OrderItem[];
  };
}

const Page = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // GraphQL query to fetch order details
  const { data, loading, error } = useQuery<FetchOrderResponse>(FETCH_ORDER, {
    variables: {
      id: params.id,
    },
    fetchPolicy: "network-only",
  });

  const order = data?.fetchOrder;

  // Loading state
  if (loading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading order details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error.message}</div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Order not found</div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={router.back}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Order {params.id}
        </h2>
      </div>

      <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div>
          <CustomerInfoCard
            name={order.patient.fullName || "Unknown"}
            email={order.patient.email || ""}
            phone={order.patient.phoneNo || ""}
            totalOrders={8}
            lastOrder={formatDate(order.createdAt)}
            address={order.patient.address || ""}
            onBack={() => console.log("Go back")}
            onViewProfile={() => router.push(`/customers/${order.patient.id}`)}
            getInitials={(name) =>
              name
                .split(" ")
                .map((n) => n[0])
                .join("")
            }
          />

          <div className="p-3 md:p-6 flex flex-col gap-1.5 md:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <h2 className="text-base md:text-lg font-semibold text-black">
                  Order {order.id}
                </h2>
                <span className="text-gray-700 font-medium text-xs md:text-sm py-0.5 px-2.5 rounded-full bg-gray-100 border border-gray-200">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="hidden sm:grid grid-cols-4 text-xs font-medium text-black rounded-xl bg-gray-50 p-1.5 md:p-3">
                <div>Product</div>
                <div>Quantity</div>
                <div>Unit Price</div>
                <div>Total</div>
              </div>

              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4 items-start rounded-lg sm:rounded-xl bg-gray-50 p-1.5 md:py-2 md:px-3"
                >
                  <div className="text-gray-800 text-xs md:text-sm sm:order-1 order-1">
                    <span className="text-black font-medium text-xs sm:hidden inline-block pe-2">
                      Product:
                    </span>
                    {item.product.title}
                  </div>
                  <div className="flex sm:order-2 order-3">
                    <span className="text-black font-medium text-xs sm:hidden inline-block pe-2">
                      Quantity:
                    </span>
                    <span className="inline-block rounded-full sm:px-2 sm:py-0.5 text-xs sm:font-medium text-gray-800 sm:text-gray-700 sm:bg-gray-50 sm:border sm:border-gray-200">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="text-gray-800 flex sm:justify-start justify-end text-xs md:text-sm font-normal sm:order-3 order-2">
                    <span className="text-black font-medium text-xs sm:hidden inline-block pe-2">
                      Unit Price:
                    </span>
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="text-gray-800 text-xs flex sm:justify-start justify-end md:text-sm sm:font-medium sm:order-4 order-4">
                    <span className="text-black font-medium text-xs sm:hidden inline-block pe-2">
                      Total:
                    </span>
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-4 bg-sky-50 p-1.5 md:py-2 md:px-3 rounded-lg md:rounded-xl">
                <div className="col-span-3 text-gray-800 font-semibold text-sm md:text-lg">
                  Order Total
                </div>
                <div className="text-sm md:text-lg font-semibold text-primary">
                  ${order.totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-6 !pt-0 flex flex-col gap-1.5 md:gap-3">
          <h2 className="font-semibold text-base md:text-lg text-black ">
            Shipping Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4">
            <div className="rounded-lg flex items-center gap-1 md:gap-2 p-2 bg-gray-50 ">
              <div className="rounded-lg bg-white border border-gray-200 flex items-center justify-center w-10 h-10">
                <DeliveryTruckIcon />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-medium text-xs text-gray-500 ">
                  Tracking Number:
                </h2>
                <h3 className="text-xs md:text-sm text-gray-800">
                  TRK123456789
                </h3>
              </div>
            </div>
            <div className="rounded-lg flex items-center gap-1 md:gap-2 p-2 bg-gray-50 ">
              <div className="rounded-lg bg-white border border-gray-200 flex items-center justify-center w-10 h-10">
                <LocationIcon />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-medium text-xs text-gray-500 ">
                  Shipping Address:
                </h2>
                <h3 className="text-xs md:text-sm text-gray-800">
                  {order.patient.address || "No address provided"}
                </h3>
              </div>
            </div>
          </div>
          <div className="flex items-center flex-col md:flex-row flex-wrap justify-end gap-1.5 md:gap-3">
            <ThemeButton
              label="Cancel Order"
              variant="outline"
              size="medium"
              icon={<CrossIcon fill="#EF4444" height="18" width="18" />}
              onClick={() => {}}
              className="w-full sm:w-fit"
              heightClass="md:h-11 h-10"
            />

            <ThemeButton
              label="Track Package"
              variant="outline"
              size="medium"
              icon={<ShipmentTrackingIcon />}
              onClick={() => {}}
              className="w-full sm:w-fit"
              heightClass="md:h-11 h-10"
            />

            <ThemeButton
              label="Print Invoice"
              variant="outline"
              size="medium"
              icon={<PrinterIcon />}
              onClick={() => {}}
              className="w-full sm:w-fit"
              heightClass="md:h-11 h-10"
            />

            <ThemeButton
              label="Send Update to Customer"
              variant="outline"
              size="medium"
              icon={<MessageOutgoingIcon />}
              onClick={() => {}}
              className="w-full sm:w-fit"
              heightClass="md:h-11 h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
