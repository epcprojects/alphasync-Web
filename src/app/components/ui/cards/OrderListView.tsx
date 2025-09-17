"use client";
import { ArrowLeftIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";

type Order = {
  id: number;
  orderId: string;
  date: string;
  customer: string;
  status: string;
  items: number;
  total: number;
  netCost: number;
  profit: number;
};

type OrderListViewProps = {
  order: Order;
  onViewCustomer?: (id: number) => void;
  onRowClick?: () => void;
};

const colorPairs = [
  { bg: "bg-red-50", text: "text-red-500" },
  { bg: "bg-blue-50", text: "text-blue-500" },
  { bg: "bg-green-50", text: "text-green-500" },
  { bg: "bg-yellow-50", text: "text-yellow-600" },
  { bg: "bg-purple-50", text: "text-purple-500" },
  { bg: "bg-pink-50", text: "text-pink-500" },
  { bg: "bg-indigo-50", text: "text-indigo-500" },
];

function getColorPair(seed: number) {
  return colorPairs[seed % colorPairs.length];
}

export function getStatusClasses(status: Order["status"]) {
  switch (status) {
    case "Delivered":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Processing":
      return "bg-amber-100 border border-amber-200 text-amber-700";
    case "Pending":
      return "bg-red-50 border border-red-200 text-red-700";
    case "Shipped":
      return "bg-indigo-100 border border-indigo-200 text-indigo-700";
    case "Cancelled":
      return "bg-gray-50 border border-gray-200 text-gray-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

export default function OrderListView({
  order: order,
  onViewCustomer,
  onRowClick,
}: OrderListViewProps) {
  const { bg, text } = getColorPair(order.id);
  return (
    <div
      onClick={onRowClick}
      key={order.id}
      className="grid cursor-pointer grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_1fr_4rem] gap-4 items-center rounded-xl bg-white p-1 md:p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]"
    >
      <div>
        <h2 className="text-gray-800 text-xs md:text-sm font-normal">
          {order.orderId}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`md:w-10 md:h-10 ${bg} ${text} flex items-center justify-center rounded-full`}
        >
          {getInitials(order.customer)}
        </span>
        <h2 className="text-gray-800 text-xs md:text-sm font-medium">
          {order.customer}
        </h2>
      </div>
      <div className="text-xs md:text-sm font-normal text-gray-600 ">
        {order.date}
      </div>

      <div className=" font-medium text-xs md:text-sm text-gray-800">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      <div className=" font-medium text-xs md:text-sm text-gray-800">
        <span className="inline-block rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">
          {order.items}
        </span>
      </div>

      <div className="text-gray-800 font-medium text-xs md:text-sm">
        ${order.total}
      </div>

      <div className="text-gray-800 font-normal text-xs md:text-sm">
        ${order.netCost}
      </div>

      <div className="text-green-600 font-normal text-xs md:text-sm">
        ${order.profit}
      </div>

      <div className=" flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewCustomer?.(order.id);
          }}
          className="flex rotate-180 md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
        >
          <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
        </button>
      </div>
    </div>
  );
}
