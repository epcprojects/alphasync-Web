"use client";
import { ArrowLeftIcon, PackageOutlineIcon } from "@/icons";
import Tooltip from "../tooltip";
import { useIsMobile } from "@/hooks/useIsMobile";

type Order = {
  orderId: string;
  date: string;
  status: string;
  totalAmount: number;
};

type CustomerOrderHistroyViewProps = {
  order: Order;
  onViewOrderDetails?: (id: string) => void;
  onRowClick?: () => void;
};

const statusStyles: Record<string, string> = {
  Delivered: "bg-green-50 text-green-700 border border-green-200",
  paid: "bg-green-50 text-green-700 border border-green-200",
  Processing: "bg-amber-50 text-amber-700 border border-amber-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
  canceled: "bg-red-50 text-red-700 border border-red-200",
  Shipped: "bg-blue-50 text-blue-700 border border-blue-200",
  pending_payment: "bg-orange-50 text-orange-700 border border-orange-200",
};

function formatStatusDisplay(status: string) {
  switch (status) {
    case "pending_payment":
      return "Pending Payment";
    case "canceled":
      return "Cancelled";
    case "cancelled":
      return "cancelled";
    default:
      return status;
  }
}

export default function CustomerOrderHistroyView({
  order: customer,
  onViewOrderDetails,
  onRowClick,
}: CustomerOrderHistroyViewProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div
        onClick={onRowClick}
        key={customer.orderId}
        className="bg-gray-50 p-2 rounded-lg space-y-2"
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 sm:gap-3">
            <span className="w-7 h-7 md:h-8 shrink-0 text-gray-700 md:w-8 rounded-md bg-white border border-lightGray flex items-center justify-center">
              <PackageOutlineIcon width="18" height="18" fill="currentColor" />
            </span>
            <h3 className="font-semibold sm:font-normal line-clamp-1 text-gray-800 text-sm md:text-sm">
              {customer.orderId}
            </h3>
          </div>
          <div
            className={`px-2 py-0.5 rounded-full text-sm font-medium text-center capitalize w-fit ${
              statusStyles[customer.status] ||
              "bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            {formatStatusDisplay(customer.status)}
          </div>
        </div>

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center  gap-1.5 w-full">
            <span className="text-black font-medium text-sm block">Date:</span>
            <span className="text-gray-800 text-sm font-normal block">
              {customer.date}
            </span>
          </div>

          <div className="flex items-center gap-1.5 w-full justify-end">
            <span className="text-black font-medium text-sm block">Total:</span>
            <span className="text-gray-800 text-sm font-normal block ">
              ${customer.totalAmount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onRowClick}
      key={customer.orderId}
      className="grid cursor-pointer hover:bg-gray-100 group grid-cols-[1fr_1fr_1fr_1fr_5rem] gap-4 items-center rounded-lg bg-gray-50 p-1 md:p-2 "
    >
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 md:h-10 shrink-0 text-gray-700 md:w-10 rounded-lg bg-white border border-lightGray flex items-center justify-center">
          <PackageOutlineIcon width="20" height="20" fill="currentColor" />
        </span>
        <h3 className="font-normal line-clamp-1 text-gray-800 text-xs md:text-base">
          {customer.orderId}
        </h3>
      </div>
      <div className="font-normal line-clamp-1 text-gray-800 text-xs md:text-base">
        {customer.date}
      </div>

      {/* <div className="">{customer.status}</div> */}
      <div
        className={`px-2 py-0.5 rounded-full text-sm font-medium text-center capitalize w-fit ${
          statusStyles[customer.status] ||
          "bg-gray-100 text-gray-700 border border-gray-300"
        }`}
      >
        {formatStatusDisplay(customer.status)}
      </div>

      <div className="font-normal line-clamp-1 text-gray-800 text-xs md:text-base">
        ${customer.totalAmount}
      </div>

      <div className=" flex items-center justify-center gap-2">
        <Tooltip content="View Order Details">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOrderDetails?.(customer.orderId);
            }}
            className="flex rotate-180 md:h-10 md:w-10 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:bg-gradient-to-r group-hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <ArrowLeftIcon width="18" height="18" stroke={"currentColor"} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
