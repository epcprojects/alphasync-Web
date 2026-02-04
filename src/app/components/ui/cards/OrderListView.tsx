"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowLeftIcon, TrashBinIcon } from "@/icons";
import Tooltip from "../tooltip";
import ProfileImage from "@/app/components/ui/ProfileImage";

type Order = {
  id: number;
  orderId: string | number;
  displayId: number;
  date: string | React.ReactNode;
  customer: string | React.ReactNode;
  /** When customer is ReactNode, use this for ProfileImage/avatar. */
  customerDisplayName?: string;
  /** Optional doctor name for admin layout (separate column on customer orders). */
  doctorName?: string | null;
  status: string;
  items: number;
  total: number;
  netCost: number;
  profit: number;
  imageUrl?: string | null;
  customerEmail?: string | null;
  isClinicOrder?: boolean;
};

export type OrderListViewLayout = "default" | "admin";

type OrderListViewProps = {
  order: Order;
  onViewOrderDetail?: (id: number) => void;
  onRowClick?: () => void;
  hideCustomer?: boolean;
  hideProfit?: boolean;
  onPayNow?: (id?: number) => void;
  showPayNow?: boolean;
  onCancelOrder?: () => void;
  /** "admin" = fixed 9-column grid, view-only actions, admin mobile card. "default" = doctor-side layout. */
  layout?: OrderListViewLayout;
  /** Optional grid template for desktop row (e.g. "md:grid-cols-[1.5fr_2.5fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr]"). When set, overrides layout-based grid. */
  gridCols?: string;
};

const colorPairs = [
  { bg: "bg-red-100", text: "text-red-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-yellow-100", text: "text-yellow-600" },
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-indigo-100", text: "text-indigo-600" },
];

function getColorPair(seed: number | undefined) {
  if (seed === undefined || isNaN(seed)) {
    return colorPairs[0];
  }
  return colorPairs[Math.abs(seed) % colorPairs.length];
}

export function getStatusClasses(status: Order["status"]) {
  switch (status) {
    case "Delivered":
      return "bg-green-50 border border-green-200 text-green-700";
    case "paid":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Processing":
      return "bg-amber-50 border border-amber-200 text-amber-700";
    case "Pending":
      return "bg-red-50 border border-red-200 text-red-700";
    case "pending_payment":
      return "bg-orange-50 border border-orange-200 text-orange-700";
    case "Shipped":
      return "bg-indigo-50 border border-indigo-200 text-indigo-700";
    case "cancelled":
      return "bg-gray-50 border border-gray-200 text-gray-700";
    case "canceled":
      return "bg-red-50 border border-red-200 text-red-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

export function formatStatusDisplay(status: string) {
  switch (status) {
    case "pending_payment":
      return "Pending Payment";
    default:
      return status;
  }
}

export default function OrderListView({
  order: order,
  onViewOrderDetail,
  onRowClick,
  hideCustomer = false,
  hideProfit = false,
  onPayNow,
  showPayNow = false,
  onCancelOrder,
  layout = "default",
  gridCols: gridColsProp,
}: OrderListViewProps) {
  const { bg, text } = getColorPair(order.id) || colorPairs[0];

  const ismobile = useIsMobile();
  const isAdminLayout = layout === "admin";
  const customerNameForAvatar =
    typeof order.customer === "string"
      ? order.customer
      : order.customerDisplayName ?? "";

  // Admin layout: cleaner mobile card
  if (ismobile && isAdminLayout) {
    return (
      <div
        onClick={onRowClick}
        key={order.id}
        className="bg-white rounded-xl p-4 shadow-table cursor-pointer border border-gray-100 hover:border-gray-200 transition-colors"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <ProfileImage
              imageUrl={order.imageUrl}
              fullName={customerNameForAvatar}
              email={order.customerEmail}
              bg={bg}
              text={text}
              width={40}
              height={40}
              className="rounded-full shrink-0"
              fallbackClassName={`w-10 h-10 ${bg} ${text} shrink-0 rounded-full flex items-center justify-center font-medium text-sm`}
            />
            <div className="min-w-0">
              <p className="text-gray-500 text-xs font-medium">Order #{order.orderId}</p>
              <div className="text-gray-900 font-semibold truncate">{order.customer}</div>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusClasses(
              order.status
            )}`}
          >
            {formatStatusDisplay(order.status)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {order.doctorName != null && order.doctorName !== "" && (
            <div className="col-span-2">
              <p className="text-gray-500">Doctor</p>
              <p className="text-gray-900 font-medium">{order.doctorName}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Payment Date</p>
            <p className="text-gray-900 font-medium">{order.date}</p>
          </div>
          <div>
            <p className="text-gray-500">Items</p>
            <p className="text-gray-900 font-medium">{order.items}</p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p className="text-gray-900 font-medium">${order.total}</p>
          </div>
          <div>
            <p className="text-gray-500">Net Cost</p>
            <p className="text-gray-900 font-medium">${order.netCost}</p>
          </div>
          <div>
            <p className="text-gray-500">Profit</p>
            <p className="text-green-600 font-medium">${order.profit}</p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrderDetail?.(order.displayId);
            }}
            className="inline-flex items-center gap-1.5 text-primary font-medium text-sm hover:underline"
          >
            View order
            <ArrowLeftIcon width="14" height="14" stroke="currentColor" />
          </button>
        </div>
      </div>
    );
  }

  // Default (doctor) mobile layout
  if (ismobile)
    return (
      <div
        onClick={onRowClick}
        key={order.id}
        className="bg-white flex flex-col gap-2 p-2  cursor-pointer shadow-table  rounded-xl "
      >
        <div className="flex items-start justify-between">
          {!hideCustomer && (
            <div className="flex items-start gap-2 ">
              <ProfileImage
                imageUrl={order.imageUrl}
                fullName={customerNameForAvatar}
                email={order.customerEmail}
                bg={bg}
                text={text}
              />
              <div>
                <h2 className="text-gray-800 text-base sm:hidden font-semibold">
                  {order.orderId}
                </h2>
                <div className="text-gray-800 text-sm font-medium">
                  {order.customer}
                </div>
              </div>
            </div>
          )}
          {hideCustomer && (
            <div>
              <h2 className="text-gray-800 text-base font-semibold">
                {order.orderId}
              </h2>
            </div>
          )}

          <div className=" font-medium text-xs md:text-sm text-gray-800">
            <span
              className={`inline-block rounded-full capitalize px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getStatusClasses(
                order.status
              )}`}
            >
              <span>{formatStatusDisplay(order.status)}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">Date:</span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.date}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-fit">
            <span className="text-black font-medium text-sm block">Items:</span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.items}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">Total:</span>
            <span className="text-gray-800 text-sm font-normal block">
              ${order.total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Net Cost:
            </span>
            <span className="text-gray-800 text-sm font-normal block">
              ${order.netCost}
            </span>
          </div>

          {!hideProfit && (
            <div className="flex items-center gap-1.5 w-fit">
              <span className="text-black font-medium text-sm block">
                Profit:
              </span>

              <span className="text-green-600 text-sm font-normal block">
                ${order.profit || 0}
              </span>
            </div>
          )}
          <div className="flex items-center justify-end gap-1.5 w-full flex-nowrap">
            {!isAdminLayout && showPayNow && order.status === "pending_payment" && onPayNow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPayNow(order.displayId);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Pay Now
              </button>
            )}
            {!isAdminLayout &&
              order.isClinicOrder &&
              order.status === "pending_payment" &&
              onCancelOrder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelOrder();
                  }}
                  className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 shrink-0 cursor-pointer"
                  aria-label="Cancel order"
                >
                  <TrashBinIcon width="14" height="14" />
                </button>
              )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewOrderDetail?.(order.displayId);
              }}
              className="flex rotate-180 md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:bg-gradient-to-r group-hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary shrink-0"
            >
              <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
            </button>
          </div>
        </div>
      </div>
    );

  const gridCols =
    gridColsProp ??
    (isAdminLayout
      ? "md:grid-cols-[1.5fr_2.5fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr]"
      : hideCustomer
        ? hideProfit
          ? "md:grid-cols-[4rem_4rem_6rem_1fr_1fr_1fr_6rem] lg:grid-cols-[1fr_1fr_1.5fr_1fr_1fr_1fr_1.5fr]"
          : "grid-cols-[4fr_4fr_4fr_2fr_4fr_4fr_4fr]"
        : " grid-cols-[1.5fr_2.5fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr]");

  return (
    <div
      onClick={onRowClick}
      key={order.id}
      className={`hidden sm:grid hover:bg-gray-100 group ${gridCols} gap-4 items-center rounded-xl bg-white p-3 shadow-table ${isAdminLayout ? "md:grid px-4 py-3 border border-gray-100" : ""}`}
    >
      <div className="sm:block hidden">
        <h2 className="text-gray-800 text-sm md:text-base font-normal">
          {order.orderId}
        </h2>
      </div>
      {!hideCustomer && (
        <div className="flex items-center gap-2 md:gap-3">
          <ProfileImage
            imageUrl={order.imageUrl}
            fullName={customerNameForAvatar}
            email={order.customerEmail}
            bg={bg}
            text={text}
            width={40}
            height={40}
            className="rounded-full object-cover bg-gray-200 w-10 h-10 shrink-0 hidden lg:flex"
            fallbackClassName={`w-10 h-10 ${bg} ${text} shrink-0 hidden lg:flex items-center font-medium justify-center rounded-full`}
          />
          <div>
            <h2 className="text-gray-800 text-sm md:text-base sm:hidden font-semibold">
              {order.orderId}
            </h2>
            <div className="text-gray-800 text-sm md:text-base font-medium">
              {order.customer}
            </div>
          </div>
        </div>
      )}
      {isAdminLayout && (
        <div className="text-sm md:text-base font-normal text-gray-600">
          {order.doctorName ?? "—"}
        </div>
      )}
      <div className="text-sm md:text-base font-normal text-gray-600 ">
        {order.date}
      </div>

      <div
        className={`flex md:inline w-fit rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium text-center self-center ${getStatusClasses(
          order.status
        )}`}
      >
        <span className="lg:whitespace-nowrap capitalize">
          {formatStatusDisplay(order.status)}
        </span>
      </div>

      <div className=" font-medium text-sm md:text-base text-gray-800">
        <span className="inline-block rounded-full px-2 py-0.5 text-xs  font-medium text-gray-700 bg-gray-50 border border-gray-200">
          {order.items}
        </span>
      </div>

      <div className="text-gray-800 font-medium text-sm md:text-base">
        ${order.total}
      </div>

      <div className="text-gray-800 font-normal text-sm md:text-base">
        ${order.netCost}
      </div>

      {!hideProfit && (
        <div className="text-green-600 font-normal text-sm md:text-base">
          ${order.profit}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 flex-nowrap">
        {!isAdminLayout && showPayNow && order.status === "pending_payment" && onPayNow && (
          <Tooltip content="Pay Now">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPayNow(order.displayId);
              }}
              className="px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pay Now
            </button>
          </Tooltip>
        )}
        {!isAdminLayout &&
          order.isClinicOrder &&
          order.status === "pending_payment" &&
          onCancelOrder && (
            <Tooltip content="Cancel Order">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelOrder();
                }}
                className="flex md:h-8 md:w-8 h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 shrink-0 cursor-pointer"
                aria-label="Cancel order"
              >
                <TrashBinIcon width="14" height="14" />
              </button>
            </Tooltip>
          )}
        <Tooltip content={isAdminLayout ? "View order" : "View Order"}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrderDetail?.(order.displayId);
            }}
            className={`flex rotate-180 md:h-8 md:w-8 h-7 w-7 items-center justify-center rounded-md border cursor-pointer shrink-0 ${isAdminLayout
              ? "border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              : "hover:bg-gradient-to-r hover:text-white group-hover:bg-gradient-to-r group-hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white border-primary"
              }`}
          >
            <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
