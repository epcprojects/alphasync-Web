"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AutoReloadIcon, ReloadIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";

type Order = {
  id: number;
  customer: string;
  product: string;
  lastOrder: string;
  daysSince: number;
};

type RefillViewProps = {
  order: Order;
  onContactClick: () => void;
  onReOrderClick: () => void;
  onAutoReOrderClick: () => void;
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

export default function RefillView({
  order: order,
  onContactClick,
  onReOrderClick,
  onAutoReOrderClick,
  onRowClick,
}: RefillViewProps) {
  const { bg, text } = getColorPair(order.id);
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <div className="bg-white rounded-lg flex flex-col gap-1.5 p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2">
          <span
            className={`w-10 h-10 shrink-0 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
          >
            {getInitials(order.customer)}
          </span>
          <h2 className="text-gray-800 whitespace-nowrap text-sm font-semibold">
            {order.customer}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-black font-medium text-xs pe-1">
              Product:
            </span>
            <span className="text-gray-800 font-normal text-xs">
              {order.product}
            </span>
          </div>

          <div>
            <span className="text-black font-medium text-xs pe-1">
              Last Order:
            </span>
            <span className="text-gray-800 font-normal text-xs">
              {order.lastOrder}
            </span>
          </div>
        </div>

        <div>
          <span className="text-black font-medium text-xs pe-1">
            Days Since:
          </span>
          <span className="text-gray-800 font-normal text-xs">
            {order.daysSince}
          </span>
        </div>

        <div className=" flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContactClick();
            }}
            className="flex px-3 py-2 gap-1 md:gap-2 w-full text-xs md:text-sm bg-blue-500 text-white  items-center justify-center rounded-md border cursor-pointer border-blue-500"
          >
            <svg
              width="15"
              height="16"
              viewBox="0 0 15 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.78125 7.7292C0.78125 4.14899 3.80952 1.28125 7.5 1.28125C11.1905 1.28125 14.2188 4.14899 14.2188 7.7292C14.2188 11.3094 11.1905 14.1771 7.5 14.1771C7.06508 14.1777 6.63147 14.1374 6.20436 14.0572C6.05612 14.0294 5.96193 14.0118 5.89185 14.0022C5.83958 13.9942 5.78707 14.0137 5.76734 14.0244C5.69577 14.0584 5.60043 14.109 5.45446 14.1866C4.55964 14.6625 3.51565 14.8312 2.50873 14.644C2.34613 14.6137 2.2115 14.5 2.15446 14.3448C2.09742 14.1895 2.1264 14.0157 2.23073 13.8874C2.52311 13.5278 2.72415 13.0946 2.81305 12.6282C2.8371 12.5 2.78267 12.3258 2.61532 12.1558C1.48107 11.0041 0.78125 9.44649 0.78125 7.7292ZM5 7.375C4.65482 7.375 4.375 7.65482 4.375 8C4.375 8.34518 4.65482 8.625 5 8.625H5.00561C5.35079 8.625 5.63061 8.34518 5.63061 8C5.63061 7.65482 5.35079 7.375 5.00561 7.375H5ZM7.4972 7.375C7.15202 7.375 6.8722 7.65482 6.8722 8C6.8722 8.34518 7.15202 8.625 7.4972 8.625H7.5028C7.84798 8.625 8.1278 8.34518 8.1278 8C8.1278 7.65482 7.84798 7.375 7.5028 7.375H7.4972ZM9.36939 8C9.36939 7.65482 9.64922 7.375 9.99439 7.375H10C10.3452 7.375 10.625 7.65482 10.625 8C10.625 8.34518 10.3452 8.625 10 8.625H9.99439C9.64922 8.625 9.36939 8.34518 9.36939 8Z"
                fill="white"
              />
            </svg>
            Contact
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onReOrderClick();
            }}
            className="flex px-3 py-2 gap-1 md:gap-2 w-full text-xs md:text-sm bg-green-600 text-white  items-center justify-center rounded-md border cursor-pointer border-green-600"
          >
            <ReloadIcon />
            Reorder
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAutoReOrderClick();
            }}
            className="flex px-3 py-2 gap-1 md:gap-2 w-full whitespace-nowrap text-xs md:text-sm bg-primary text-white  items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <AutoReloadIcon />
            Auto-Reorder
          </button>
        </div>
      </div>
    );
  return (
    <div
      onClick={onRowClick}
      key={order.id}
      className="grid cursor-pointer  sm:grid-cols-[4fr_2fr_1fr_1fr_3fr] lg:grid-cols-[1fr_1fr_1fr_1fr_400px] gap-4 items-center rounded-xl bg-white p-1 md:p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center gap-2">
        <span
          className={`md:w-10 md:h-10 shrink-0 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
        >
          {getInitials(order.customer)}
        </span>
        <h2 className="text-gray-800 whitespace-nowrap text-xs md:text-sm font-medium">
          {order.customer}
        </h2>
      </div>

      <div className="text-xs md:text-sm text-gray-800 font-normal">
        {order.product}
      </div>

      <div className="text-xs md:text-sm text-gray-800 font-normal">
        {order.lastOrder}
      </div>

      <div className=" font-medium text-xs md:text-sm text-gray-800">
        <span className="inline-block rounded-full px-2 py-0.5 text-xs md:text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">
          {order.daysSince}
        </span>
      </div>

      <div className=" flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContactClick();
          }}
          className="flex px-3 py-2 gap-1 md:gap-2 md:h-8  h-6 text-xs md:text-sm bg-blue-500 text-white  items-center justify-center rounded-md border cursor-pointer border-blue-500"
        >
          <svg
            width="15"
            height="16"
            viewBox="0 0 15 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.78125 7.7292C0.78125 4.14899 3.80952 1.28125 7.5 1.28125C11.1905 1.28125 14.2188 4.14899 14.2188 7.7292C14.2188 11.3094 11.1905 14.1771 7.5 14.1771C7.06508 14.1777 6.63147 14.1374 6.20436 14.0572C6.05612 14.0294 5.96193 14.0118 5.89185 14.0022C5.83958 13.9942 5.78707 14.0137 5.76734 14.0244C5.69577 14.0584 5.60043 14.109 5.45446 14.1866C4.55964 14.6625 3.51565 14.8312 2.50873 14.644C2.34613 14.6137 2.2115 14.5 2.15446 14.3448C2.09742 14.1895 2.1264 14.0157 2.23073 13.8874C2.52311 13.5278 2.72415 13.0946 2.81305 12.6282C2.8371 12.5 2.78267 12.3258 2.61532 12.1558C1.48107 11.0041 0.78125 9.44649 0.78125 7.7292ZM5 7.375C4.65482 7.375 4.375 7.65482 4.375 8C4.375 8.34518 4.65482 8.625 5 8.625H5.00561C5.35079 8.625 5.63061 8.34518 5.63061 8C5.63061 7.65482 5.35079 7.375 5.00561 7.375H5ZM7.4972 7.375C7.15202 7.375 6.8722 7.65482 6.8722 8C6.8722 8.34518 7.15202 8.625 7.4972 8.625H7.5028C7.84798 8.625 8.1278 8.34518 8.1278 8C8.1278 7.65482 7.84798 7.375 7.5028 7.375H7.4972ZM9.36939 8C9.36939 7.65482 9.64922 7.375 9.99439 7.375H10C10.3452 7.375 10.625 7.65482 10.625 8C10.625 8.34518 10.3452 8.625 10 8.625H9.99439C9.64922 8.625 9.36939 8.34518 9.36939 8Z"
              fill="white"
            />
          </svg>

          <span className="lg:block hidden">Contact</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onReOrderClick();
          }}
          className="flex px-3 py-2 gap-1 md:gap-2 md:h-8  h-6 text-xs md:text-sm bg-green-600 text-white  items-center justify-center rounded-md border cursor-pointer border-green-600"
        >
          <ReloadIcon />
          <span className="lg:block hidden">Reorder</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAutoReOrderClick();
          }}
          className="flex px-3 py-2 gap-1 md:gap-2 md:h-8  h-6 text-xs md:text-sm bg-primary text-white  items-center justify-center rounded-md border cursor-pointer border-primary"
        >
          <AutoReloadIcon />

          <span className="lg:block hidden">Auto-Reorder</span>
        </button>
      </div>
    </div>
  );
}
