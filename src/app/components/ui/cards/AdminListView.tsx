"use client";
import { PencilEditIcon, TrashBinIcon, MailIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";
import Tooltip from "../tooltip";
import { UserAttributes } from "@/lib/graphql/attributes";

type AdminListingProps = {
  admin: UserAttributes;
  onDeleteAdmin?: (id: number) => void;
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

// Helper function to determine display status based on invitationStatus and status
function getDisplayStatus(invitationStatus?: string, status?: string): string {
  const isInvitationAccepted = invitationStatus === "accepted";
  const isStatusActive = status?.toUpperCase() === "ACTIVE";

  // If invitation accepted AND status active → show "Active"
  if (isInvitationAccepted && isStatusActive) {
    return "Active";
  }
  // If invitation NOT accepted AND status active → show "Inactive"
  if (!isInvitationAccepted && isStatusActive) {
    return "Inactive";
  }
  // For other cases, return the status as is or "Inactive" as default
  return status || "Inactive";
}

export default function AdminListView({
  admin,
  onDeleteAdmin,
  onResendInvitation,
}: AdminListingProps) {
  const { bg, text } = getColorPair(admin.id);

  const displayStatus = getDisplayStatus(admin.invitationStatus, admin.status);

  return (
    <div
      key={admin.id}
      className="grid grid-cols-12 gap-2 items-center rounded-xl bg-white p-1 md:p-3 shadow-table"
    >
      <div className="flex items-center gap-2 col-span-4">
        <span
          className={`md:w-10 md:h-10 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
        >
          {getInitials(admin.fullName ?? admin.email ?? "----")}
        </span>
        <div>
          <h2 className="text-gray-800 text-xs md:text-sm font-medium">
            {admin.fullName ?? "----"}
          </h2>
          <h2 className="text-gray-800 text-xs font-normal">{admin.email}</h2>
        </div>
      </div>

      <div className="text-xs md:text-sm font-normal text-gray-800 col-span-3">
        {admin.phoneNo ?? "—"}
      </div>

      <div className="font-medium text-xs md:text-sm text-gray-800 col-span-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
            displayStatus
          )}`}
        >
          {displayStatus}
        </span>
      </div>

      <div className="col-span-3 flex items-center justify-start gap-1">
        {admin.invitationStatus === "pending" && (
          <Tooltip content="Resend Invitation">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (admin.id) onResendInvitation?.(admin.id);
              }}
              className="flex md:h-8 md:w-8 h-6 w-6 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-gray-800 bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
            >
              <MailIcon />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Delete">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (admin.id) onDeleteAdmin?.(Number(admin.id));
            }}
            className="flex md:h-8 md:w-8 h-6 w-6 hover:bg-red-50 hover:border-red-500 hover:text-white text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-gray-200"
          >
            <TrashBinIcon width="15" height="15" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
