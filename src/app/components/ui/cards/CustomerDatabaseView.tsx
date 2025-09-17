"use client";
import { ArrowLeftIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";

type Customer = {
  id: number;
  name: string;
  contact: string;
  email: string;
  dateOfBirth: string;
  lastOrder: string;
  totalOrder: number;
  status: string;
};

type CustomerDatabaseViewProps = {
  customer: Customer;
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

function getStatusClasses(status: Customer["status"]) {
  switch (status) {
    case "Active":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Inactive":
      return "bg-gray-100 border border-gray-200 text-gray-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

export default function CustomerDatabaseView({
  customer: customer,
  onViewCustomer,
  onRowClick,
}: CustomerDatabaseViewProps) {
  const { bg, text } = getColorPair(customer.id);
  return (
    <div
      onClick={onRowClick}
      key={customer.id}
      className="grid cursor-pointer grid-cols-12 gap-4 items-center rounded-xl bg-white p-1 md:p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]"
    >
      <div className="col-span-3 flex items-center gap-3">
        <div className="flex items-center gap-1 md:gap-2">
          <span
            className={`md:w-10 md:h-10 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
          >
            {getInitials(customer.name)}
            {/* <Image
              alt=""
              width={256}
              height={256}
              src={"/images/arinaProfile.png"}
              className="rounded-full w-full h-full"
            /> */}
          </span>

          <h3 className="font-medium line-clamp-1 text-gray-800 text-sm md:text-base">
            {customer.name}
          </h3>
        </div>
      </div>
      <div className="col-span-2">{customer.contact}</div>

      <div className="col-span-2">
        <button className="text-gray-800 text-xs md:text-sm font-medium">
          {customer.email}
        </button>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        {customer.dateOfBirth}
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        {customer.lastOrder}
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        <span className="inline-block rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs md:text-sm font-medium text-gray-700">
          {customer.totalOrder}
        </span>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
            customer.status
          )}`}
        >
          {customer.status}
        </span>
      </div>

      <div className="col-span-1 flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewCustomer?.(customer.id);
          }}
          className="flex rotate-180 md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
        >
          <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
        </button>
      </div>
    </div>
  );
}
