"use client";
import { PencilEditIcon, TrashBinIcon, MailIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";
import Tooltip from "../tooltip";
import { UserAttributes } from "@/lib/graphql/attributes";
import { useIsMobile } from "@/hooks/useIsMobile";

type DoctorListingProps = {
  doctor: UserAttributes;
  onEditDoctor?: (id: number) => void;
  onDeleteDoctor?: (id: number) => void;
  onResendInvitation?: (id: string | number) => void;
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

// ✅ make it more flexible (accept string or undefined)
function getColorPair(seed: number | string | undefined) {
  const validSeed = typeof seed === "number" ? seed : Number(seed) || 0;
  const index = Math.abs(validSeed) % colorPairs.length;
  return colorPairs[index] || colorPairs[0];
}

export function getStatusClasses(status?: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 border border-emerald-300 text-emerald-800";
    case "Inactive":
      return "bg-rose-100 border border-rose-300 text-rose-800";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

// Helper function to get invitation status chip classes
export function getInvitationStatusClasses(invitationStatus?: string) {
  const normalizedStatus = invitationStatus?.toLowerCase();
  switch (normalizedStatus) {
    case "accepted":
      return "bg-emerald-100 border border-emerald-300 text-emerald-800";
    case "pending":
      return "bg-gray-100 border border-gray-300 text-gray-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}

// Helper function to determine display status - only Active or Inactive
function getDisplayStatus(status?: string): string {
  const isStatusActive = status?.toUpperCase() === "ACTIVE";

  // If status is active → show "Active" (green)
  if (isStatusActive) {
    return "Active";
  }

  // Otherwise → show "Inactive" (red)
  return "Inactive";
}

export default function DoctorListView({
  doctor,
  onDeleteDoctor,
  onEditDoctor,
  onResendInvitation,
}: DoctorListingProps) {
  const { bg, text } = getColorPair(doctor.id);
  const displayStatus = getDisplayStatus(doctor.status);

  const ismobile = useIsMobile();

  if (ismobile)
    return (
      <div
        key={doctor.id}
        className="bg-white flex flex-col gap-2 p-2  cursor-pointer  rounded-xl shadow-table"
      >
        <div className="flex items-start flex-wrap gap-1 justify-between mb-2">
          <div className="flex items-start sm:items-center gap-2 ">
            <span
              className={`w-9 h-9 shrink-0 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
            >
              {getInitials(doctor.fullName ?? doctor.email ?? "----")}
            </span>

            <div>
              <h2 className="text-gray-800 text-base md:text-base font-semibold">
                {doctor.fullName ?? "----"}
              </h2>
              <h2 className="text-gray-800 text-sm md:text-sm font-normal">
                {doctor.phoneNo ?? "—"}
              </h2>
              <h2 className="text-gray-800 text-sm md:text-sm font-normal">
                {doctor.email}
              </h2>
            </div>
          </div>

          <div className=" font-medium flex justify-end  gap-1 flex-wrap text-xs md:text-sm text-gray-800">
            <span className="inline-block rounded-full px-2 capitalize py-0.5 text-xs md:text-sm font-medium whitespace-nowrap bg-blue-100 border border-blue-300 text-blue-800">
              {doctor.specialty || "Unknown"}
            </span>

            <span
              className={`inline-block rounded-full px-2 py-0.5 capitalize text-xs md:text-sm font-medium whitespace-nowrap ${getStatusClasses(
                displayStatus
              )}`}
            >
              {displayStatus}
            </span>

            <span
              className={`inline-block rounded-full px-2 py-0.5 capitalize text-xs md:text-sm font-medium whitespace-nowrap ${getInvitationStatusClasses(
                doctor.invitationStatus
              )}`}
            >
              {doctor.invitationStatus || "Pending"}
            </span>
          </div>
        </div>
        <div className="flex items-end sm:items-center gap-1 w-full">
          <div className="flex items-start flex-col gap-1 w-full">
            <span className="text-black whitespace-nowrap font-medium text-sm block">
              Medical License:
            </span>
            <span className="text-gray-800 text-sm font-normal block">
              {doctor.medicalLicense ?? "—"} {doctor.medicalLicense ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-start gap-1">
            {doctor.invitationStatus === "pending" && (
              <Tooltip content="Resend Invitation">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "Resend button clicked for doctor:",
                      doctor.id,
                      "invitationStatus:",
                      doctor.invitationStatus
                    );
                    if (doctor.id) onResendInvitation?.(doctor.id);
                  }}
                  className="flex md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-gray-800 bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
                >
                  <MailIcon fill="currentColor" height={16} width={16} />
                </button>
              </Tooltip>
            )}
            <Tooltip content="Edit">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (doctor.id) onEditDoctor?.(Number(doctor.id));
                }}
                className="flex md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-gray-800 bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
              >
                <PencilEditIcon width="15" height="15" fill={"currentColor"} />
              </button>
            </Tooltip>

            <Tooltip content="Delete">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (doctor.id) onDeleteDoctor?.(Number(doctor.id));
                }}
                className="flex md:h-8 md:w-8 h-7 w-7 hover:bg-red-50 hover:border-red-500 hover:text-white text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
              >
                <TrashBinIcon width="15" height="15" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );

  return (
    <div
      // onClick={onRowClick}
      key={doctor.id}
      className="grid  grid-cols-[2fr_1.5fr_1.5fr_2fr_1fr_1fr_1fr] gap-2 items-center rounded-xl bg-white p-1 md:p-3 shadow-table"
    >
      <div className="flex items-center gap-2">
        <span
          className={`md:w-10 md:h-10 shrink-0 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
        >
          {getInitials(doctor.fullName ?? doctor.email ?? "----")}
        </span>

        <div>
          <h2 className="text-gray-800 text-sm md:text-base font-medium">
            {doctor.fullName ?? "----"}
          </h2>
          <h2 className="text-gray-800 text-sm  font-normal">{doctor.email}</h2>
        </div>
      </div>

      <div className="text-sm md:text-base font-normal text-gray-800">
        {doctor.specialty ?? "—"}
      </div>
      <div className="text-sm md:text-base font-normal text-gray-800">
        {doctor.phoneNo ?? "—"}
      </div>
      <div className="text-sm md:text-base font-normal text-gray-800">
        {doctor.medicalLicense ?? "—"}
      </div>

      <div className="font-medium text-sm md:text-base text-gray-800">
        <span
          className={`inline-block rounded-full capitalize px-2.5 py-0.5 text-xxs md:text-sm font-medium ${getStatusClasses(
            displayStatus
          )}`}
        >
          {displayStatus}
        </span>
      </div>

      <div className="font-medium text-sm md:text-base text-gray-800">
        <span
          className={`inline-block rounded-full capitalize px-2.5 py-0.5 text-xxs md:text-sm font-medium ${getInvitationStatusClasses(
            doctor.invitationStatus
          )}`}
        >
          {doctor.invitationStatus || "Pending"}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1">
        {doctor.invitationStatus === "pending" && (
          <Tooltip content="Resend Invitation">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log(
                  "Resend button clicked for doctor:",
                  doctor.id,
                  "invitationStatus:",
                  doctor.invitationStatus
                );
                if (doctor.id) onResendInvitation?.(doctor.id);
              }}
              className="flex md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-gray-800 bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
            >
              <MailIcon fill="currentColor" height={16} width={16} />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Edit">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (doctor.id) onEditDoctor?.(Number(doctor.id));
            }}
            className="flex md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-gray-800 bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
          >
            <PencilEditIcon width="15" height="15" fill={"currentColor"} />
          </button>
        </Tooltip>

        <Tooltip content="Delete">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (doctor.id) onDeleteDoctor?.(Number(doctor.id));
            }}
            className="flex md:h-8 md:w-8 h-7 w-7 hover:bg-red-50 hover:border-red-500 hover:text-white text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
          >
            <TrashBinIcon width="15" height="15" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
