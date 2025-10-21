"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ArrowLeftIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";
import Tooltip from "../tooltip";

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
    case "Processing":
      return "bg-amber-50 border border-amber-200 text-amber-700";
    case "Pending":
      return "bg-red-50 border border-red-200 text-red-700";
    case "Shipped":
      return "bg-indigo-50 border border-indigo-200 text-indigo-700";
    case "Cancelled":
      return "bg-gray-50 border border-gray-200 text-gray-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

export default function OrderListView({
  order: order,
  onViewOrderDetail,
  onRowClick,
}: OrderListViewProps) {
  const { bg, text } = getColorPair(order.id) || colorPairs[0];

  const ismobile = useIsMobile();

  if (ismobile)
    return (
      <div
        onClick={onRowClick}
        key={order.id}
        className="bg-white flex flex-col gap-2 p-2  cursor-pointer  rounded-xl "
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 ">
            <span
              className={`w-10 h-10 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
            >
              {getInitials(order.customer)}
            </span>
            <div>
              <h2 className="text-gray-800 text-sm sm:hidden font-semibold">
                {order.orderId}
              </h2>
              <h2 className="text-gray-800 text-xs md:text-sm font-medium">
                {order.customer}
              </h2>
             
            </div>
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
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-xs block">Date:</span>
            <span className="text-gray-800 text-xs font-normal block">
              {order.date}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-fit">
            <span className="text-black font-medium text-xs block">Items:</span>
            <span className="text-gray-800 text-xs font-normal block">
              {order.items}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <span className="text-black font-medium text-xs block">Total:</span>
            <span className="text-gray-800 text-xs font-normal block">
              ${order.total}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-xs block">
              Net Cost:
            </span>
            <span className="text-gray-800 text-xs font-normal block">
              ${order.netCost}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-fit">
            <span className="text-black font-medium text-xs block">
              Profit:
            </span>
            <span className="text-green-600 text-xs font-normal block">
              ${order.profit}
            </span>
          </div>

          <div className="flex items-center justify-end gap-1.5 w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewOrderDetail?.(order.id);
              }}
              className="flex rotate-180 md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white group-hover:bg-gradient-to-r group-hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
            >
              <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
            </button>
          </div>
        </div>
      </div>
    );
  return (
    <div
      onClick={onRowClick}
      key={order.id}
      className="hidden sm:grid hover:bg-gray-100 group  md:grid-cols-[4rem_10rem_4rem_6rem_1fr_1fr_1fr_1fr_3rem] lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_1fr_4rem] gap-4 items-center rounded-xl bg-white p-3 shadow-table"
    >
      <div className="sm:block hidden">
        <h2 className="text-gray-800 text-xs md:text-sm font-normal">
          {order.orderId}
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <span
          className={`w-10 h-10 ${bg} ${text} flex items-center  font-medium  justify-center rounded-full`}
        >
          {getInitials(order.customer)}
        </span>
        <div>
          <h2 className="text-gray-800 text-sm sm:hidden font-semibold">
            {order.orderId}
          </h2>
          <h2 className="text-gray-800 text-xs md:text-sm font-medium">
            {order.customer}
          </h2>
         
        </div>
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
        <span className="inline-block rounded-full px-2 py-0.5 text-xs  font-medium text-gray-700 bg-gray-50 border border-gray-200">
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
        <Tooltip content="View Order">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrderDetail?.(order.id);
            }}
            className="flex rotate-180 md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white group-hover:bg-gradient-to-r group-hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
