"use client";
import { useIsMobile } from "@/hooks/useIsMobile";

type Order = {
  id: number;
  orderId: string | number;
  displayId: number;
  date: string;
  customer: string;
  status: string;
  items: number;
  total: number;
  netCost: number;
  profit: number;
  imageUrl?: string | null;
  customerEmail?: string | null;
  orderItems?: {
    id: string;
    quantity: number;
    price: number;
    product: {
      title: string;
    };
  }[];
};

type PeptideOrderListViewProps = {
  order: Order;
  onViewOrderDetail?: (id: number) => void;
  onRowClick?: () => void;
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
      return "Pending";
    default:
      return status;
  }
}

export default function PeptideOrderListView({
  order: order,
  onViewOrderDetail,
  onRowClick,
}: PeptideOrderListViewProps) {
  const { bg, text } = getColorPair(order.id) || colorPairs[0];

  const ismobile = useIsMobile();

  if (ismobile)
    return (
      <div
        onClick={onRowClick}
        key={order.id}
        className="bg-white flex flex-col gap-2 p-2  cursor-pointer shadow-table  rounded-xl "
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 ">
            <h2 className="text-gray-800 text-sm font-semibold">
              {order.customer}
            </h2>
          </div>

          <div className=" font-medium text-xs md:text-sm text-gray-800">
            <span
              className={`inline-block rounded-full capitalize px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getStatusClasses(
                order.status
              )}`}
            >
              {formatStatusDisplay(order.status)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Order #:
            </span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">Date:</span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.date}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">Qty:</span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.total}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Peptide:
            </span>
            <span className="text-gray-800 text-sm whitespace-nowrap font-normal block">
              {order.orderItems && order.orderItems.length > 0
                ? order.orderItems[0].product.title
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Mark-up:
            </span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.total}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Net Profit:
            </span>
            <span className="text-green-600 text-sm font-normal block">
              {order.profit}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Base Price:
            </span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.total}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">Total:</span>
            <span className="text-gray-800 text-sm font-normal block">
              {order.profit}
            </span>
          </div>
        </div>

        {/* <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">
              Net Cost:
            </span>
            <span className="text-gray-800 text-sm font-normal block">
              ${order.netCost}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-fit">
            <span className="text-black font-medium text-sm block">
              Profit:
            </span>

            <span className="text-green-600 text-sm font-normal block">
              ${order.profit || 0}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewOrderDetail?.(order.displayId);
              }}
              className="flex rotate-180 md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:bg-gradient-to-r group-hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
            >
              <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
            </button>
          </div>
        </div> */}
      </div>
    );
  return (
    <div
      onClick={onRowClick}
      key={order.id}
      className="hidden sm:grid hover:bg-gray-100 group  md:grid md:grid-cols-[5rem_5rem_1fr_1fr_3rem_3rem_3rem_1fr] lg:grid-cols-[8rem_5rem_2fr_2fr_1fr_1fr_1fr_1fr_5rem_9rem] gap-2 lg:gap-4 items-center rounded-xl bg-white p-3 shadow-table cursor-pointer"
    >
      <div className="sm:block hidden">
        <h2 className="text-gray-800 text-sm md:text-base font-normal">
          {order.orderId}
        </h2>
      </div>
      <div className="text-sm md:text-base font-normal text-gray-600 ">
        {order.date}
      </div>
      <div className="text-sm md:text-base font-normal text-gray-600 ">
        {order.orderItems && order.orderItems.length > 0
          ? order.orderItems[0].product.title
          : "N/A"}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <h2 className="text-gray-800 text-sm md:text-base font-medium">
          {order.customer}
        </h2>
      </div>
      <div className=" font-medium text-sm md:text-base text-gray-800">
        <span className="inline-block rounded-full px-2 py-0.5 text-xs  font-medium text-gray-700 bg-gray-50 border border-gray-200">
          {order.items}
        </span>
      </div>

      <div className="text-gray-800 font-normal text-sm lg:block hidden md:text-base">
        ${order.netCost}
      </div>

      <div className="text-gray-800 font-normal text-sm lg:block hidden md:text-base">
        ${order.netCost}
      </div>

      <div className="text-green-600 font-normal text-sm md:text-base">
        ${order.profit}
      </div>

      <div className="text-gray-800 font-medium text-sm md:text-base">
        ${order.total}
      </div>

      <div className=" font-medium text-sm md:text-base text-gray-800">
        <span
          className={`flex md:inline rounded-full md:whitespace-nowrap wrap-break-word px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
            order.status
          )}`}
        >
          {formatStatusDisplay(order.status)}
        </span>
      </div>
    </div>
  );
}
