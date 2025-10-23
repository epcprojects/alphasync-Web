"use client";
import { ArrowLeftIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";
import Tooltip from "../tooltip";
import { UserAttributes } from "@/lib/graphql/attributes";

type Customer = {
  id: number;
  name: string;
  contact: string;
  email: string;
  dateOfBirth: string;
  lastOrder: string;
  totalOrder: number;
  status: string;
  patientOrdersCount?: string;
};

type CustomerDatabaseViewProps = {
  customer?: Customer;
  patient?: UserAttributes;
  onViewCustomer?: (id: number) => void;
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

function getColorPair(seed: number | string | undefined) {
  const validSeed = typeof seed === "number" ? seed : Number(seed) || 0;
  const index = Math.abs(validSeed) % colorPairs.length;
  return colorPairs[index] || colorPairs[0];
}

function getStatusClasses(status?: string) {
  switch (status) {
    case "Active":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Inactive":
      return "bg-red-50 border border-red-200 text-red-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

export default function CustomerDatabaseView({
  customer,
  patient,
  onViewCustomer,
  onRowClick,
}: CustomerDatabaseViewProps) {
  // Use patient data if available, otherwise fall back to customer data
  const id = patient?.id || customer?.id;
  const name = patient?.fullName || customer?.name;
  const contact = patient?.phoneNo || customer?.contact;
  const email = patient?.email || customer?.email;
  const dateOfBirth = patient?.createdAt
    ? new Date(patient.createdAt).toLocaleDateString()
    : customer?.dateOfBirth;
  const lastOrder = patient?.lastSignInAt
    ? new Date(patient.lastSignInAt).toLocaleDateString()
    : customer?.lastOrder;
  const totalOrder = patient?.patientOrdersCount;
  const status =
    patient?.status === "ACTIVE"
      ? "Active"
      : patient?.status === "INACTIVE"
      ? "Inactive"
      : patient?.status || customer?.status;

  const { bg, text } = getColorPair(id);

  return (
    <div
      onClick={onRowClick}
      key={id}
      className="grid cursor-pointer grid-cols-12 hover:bg-gray-100 group gap-4 items-center rounded-xl bg-white p-1 md:p-3 shadow-table"
    >
      <div className="col-span-3 flex items-center gap-3">
        <div className="flex items-center gap-1 md:gap-2">
          <span
            className={`md:w-10 md:h-10 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
          >
            {getInitials(name || "----")}
          </span>

          <h3 className="font-medium line-clamp-1 text-gray-800 text-sm md:text-base">
            {name || "----"}
          </h3>
        </div>
      </div>
      <div className="col-span-2 text-gray-800 text-xs md:text-sm font-normal">
        {contact || "—"}
      </div>

      <div className="col-span-2">
        <button className="text-gray-800 text-xs md:text-sm font-medium">
          {email || "—"}
        </button>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        {dateOfBirth || "—"}
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        {lastOrder || "—"}
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        <span className="inline-block rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {totalOrder}
        </span>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
            status
          )}`}
        >
          {status || "Unknown"}
        </span>
      </div>

      <div className="col-span-1 flex items-center justify-center gap-2">
        <Tooltip content="View Customer">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onViewCustomer?.(Number(id));
            }}
            className="flex rotate-180 md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
