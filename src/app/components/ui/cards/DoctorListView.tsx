"use client";
import { PencilEditIcon, TrashBinIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";

export type Doctor = {
  id: number;
  name: string;
  email: string;
  specialty: string;
  phone: string;
  medicalLicenseNumber: string;
  status: string;
};

type DoctorListingProps = {
  doctor: Doctor;
  onEditDoctor?: (id: number) => void;
  onDeleteDoctor?: (id: number) => void;
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

export function getStatusClasses(status: Doctor["status"]) {
  switch (status) {
    case "Active":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Inactive":
      return "bg-red-50 border border-red-200 text-red-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

export default function DoctorListView({
  doctor: doctor,
  onDeleteDoctor,
  onEditDoctor,
  onRowClick,
}: DoctorListingProps) {
  const { bg, text } = getColorPair(doctor.id);
  return (
    <div
      onClick={onRowClick}
      key={doctor.id}
      className="grid cursor-pointer grid-cols-12 gap-4 items-center rounded-xl bg-white p-1 md:p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center gap-2 col-span-3">
        <span
          className={`md:w-10 md:h-10 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
        >
          {getInitials(doctor.name)}
        </span>
        <h2 className="text-gray-800 text-xs md:text-sm font-medium">
          {doctor.email}
        </h2>
      </div>
      <div className="text-xs md:text-sm font-normal text-gray-600 col-span-2">
        {doctor.specialty}
      </div>
      <div className="text-xs md:text-sm font-normal text-gray-600 col-span-2">
        {doctor.phone}
      </div>
      <div className="text-xs md:text-sm font-normal text-gray-600 col-span-2">
        {doctor.medicalLicenseNumber}
      </div>

      <div className=" font-medium text-xs md:text-sm text-gray-800 col-span-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
            doctor.status
          )}`}
        >
          {doctor.status}
        </span>
      </div>

      <div className=" flex items-center justify-starts gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditDoctor?.(doctor.id);
          }}
          className="flex md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-gray-800 bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
        >
          <PencilEditIcon width="15" height="15" fill={"currentColor"} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteDoctor?.(doctor.id);
          }}
          className="flex md:h-8 md:w-8 h-6 w-6 hover:bg-red-50 hover:border-red-500 hover:text-white  text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
        >
          <TrashBinIcon width="15" height="15" />
        </button>
      </div>
    </div>
  );
}
