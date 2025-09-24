"use client";
import React from "react";
import Image from "next/image";
import { ThemeButton } from "@/components";
import {
  ApproveCheckIcon,
  RejectIcon,
  BubbleChatIcon,
  EyeIcon,
  NoteIcon,
  CreditCardOutlineIcon,
} from "@/icons";

export type cardVariantType = "Customer" | "Doctor";
interface PrescriptionRequestCardProps {
  imageSrc?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  status?: string;
  requestedDate?: string;
  reviewedDate?: string;
  doctorName?: string;
  price?: string;
  userNotes?: string;
  physicianNotes?: string;
  denialReason?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onChat?: () => void;
  onPayment?:() => void;
  onViewDetails?: () => void;
  onAddNote?: () => void;
  category?: string;
  cardVarient?: cardVariantType;
}

const PrescriptionRequestCard: React.FC<PrescriptionRequestCardProps> = ({
  imageSrc = "/images/fallbackImages/medicine-syrup.svg",
  title,
  subtitle,
  description,
  status,
  requestedDate,
  reviewedDate,
  doctorName,
  price,
  userNotes,
  physicianNotes,
  denialReason,
  onApprove,
  onReject,
  onChat,
  onViewDetails,
  onAddNote,
  category,
  cardVarient = "Doctor",
  onPayment,
}) => {
  function getStatusClasses(status: string) {
    switch (status) {
      case "Pending Review":
        return "bg-amber-50 border border-amber-200 text-amber-700";
      case "Approved":
        return "bg-green-50 border border-green-200 text-green-700";
      case "Denied":
        return "bg-red-50 border border-red-200 text-red-500";
      default:
        return "bg-gray-50 border border-gray-200 text-gray-700";
    }
  }

  const baseClasses =
    " flex-col flex items-start gap-1.5 md:gap-3  bg-white p-2 md:p-4";

  const variantClasses: Record<cardVariantType, string> = {
    Customer: "border-b border-b-gray-200 ",
    Doctor: "border border-gray-200 rounded-xl",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[cardVarient]}`}>
      <div className="w-full flex items-start gap-2.5 md:gap-5">
        <div className="w-14 shrink-0 h-14 md:w-20 md:h-20 rounded-lg bg-gray-100 flex items-center justify-center">
          <Image
            width={1080}
            height={1080}
            className="h-12 md:h-18 md:w-18 w-12"
            src={imageSrc}
            alt={title ? title : ""}
          />
        </div>

        <div className="w-full flex flex-col gap-0.5 md:gap-1">
          <div className="flex items-start justify-between gap-0.5 md:gap-1 ">
            <div>
              <h2 className="text-gray-800 font-semibold text-sm md:text-base">
                {title}{" "}
                {subtitle && (
                  <span className="font-normal text-xs">{subtitle}</span>
                )}
              </h2>
              {description && (
                <p className="text-[10px] text-gray-800">{description}</p>
              )}
            </div>

            {status && (
              <div>
                <span
                  className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>
            )}
          </div>

          <div className="grid gird-cols-1 md:grid-cols-5">
            {category && (
              <div>
                <span className="block mb-1 text-gray-800 text-xs md:text-sm">
                  Category
                </span>
                <span className="block text-gray-800 text-xs md:text-sm font-semibold">
                  {category}
                </span>
              </div>
            )}

            {requestedDate && (
              <div>
                <span className="block mb-1 text-gray-800 text-xs md:text-sm">
                  Requested
                </span>
                <span className="block text-gray-800 text-xs md:text-sm font-semibold">
                  {requestedDate}
                </span>
              </div>
            )}

            {reviewedDate && (
              <div>
                <span className="block mb-1 text-gray-800 text-xs md:text-sm">
                  Reviewed
                </span>
                <span className="block text-gray-800 text-xs md:text-sm font-semibold">
                  {reviewedDate}
                </span>
              </div>
            )}

            {doctorName && (
              <div>
                <span className="block mb-1 text-gray-800 text-xs md:text-sm">
                  Doctor Name
                </span>
                <span className="block text-gray-800 text-xs md:text-sm font-semibold">
                  {doctorName}
                </span>
              </div>
            )}

            {price && (
              <div>
                <span className="block mb-1 text-gray-800 text-xs md:text-sm">
                  Price
                </span>
                <span className="block text-primary text-xs md:text-sm font-semibold">
                  {price}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {userNotes && (
        <div className="w-full">
          <h2 className="text-gray-900 mb-1 font-medium text-xs md:text-sm">
            Your Notes:
          </h2>
          <div className="bg-porcelan p-1.5 md:p-3 rounded-lg w-full">
            <p className="text-sm md:text-base text-gray-600">{userNotes}</p>
          </div>
        </div>
      )}

      {physicianNotes && (
        <div className="w-full">
          <h2 className="text-gray-900 mb-1 font-medium text-xs md:text-sm">
            Physician Notes
          </h2>
          <div className="bg-porcelan p-1.5 md:p-3 rounded-lg w-full">
            <p className="text-sm md:text-base text-gray-600">
              {physicianNotes}
            </p>
          </div>
        </div>
      )}

      {denialReason && (
        <div className="w-full">
          <h2 className="text-gray-900 mb-1 font-medium text-xs md:text-sm">
            Reason for Denial
          </h2>
          <div className="bg-red-100 p-1.5 md:p-3 rounded-lg w-full">
            <p className="text-sm md:text-base text-gray-900">{denialReason}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-1 w-full md:gap-2">
        {onApprove && status !== "Approved" && cardVarient === "Doctor" && (
          <ThemeButton
            label="Approve"
            icon={<ApproveCheckIcon />}
            onClick={onApprove}
            variant="outline"
            heightClass="h-10"
          />
        )}
        {onReject && !denialReason && cardVarient === "Doctor" && (
          <ThemeButton
            label="Reject"
            icon={<RejectIcon />}
            onClick={onReject}
            variant="outline"
            heightClass="h-10"
          />
        )}
        {onChat &&
          !(
            cardVarient === "Customer" &&
            (status === "Approved" || status === "Denied")
          ) && (
            <ThemeButton
              label={cardVarient === "Doctor" ? "Chat" : "Follow up"}
              icon={<BubbleChatIcon height="20" width="20" fill="#4B5563" />}
              onClick={onChat}
              variant="outline"
              heightClass="h-10"
            />
          )}

        {cardVarient === "Customer" && status === "Approved" && (
          <ThemeButton
            label="Proceed to Payment"
            icon={<CreditCardOutlineIcon />}
            onClick={onPayment}
            heightClass="h-10"
          />
        )}

        {onViewDetails && (
          <ThemeButton
            label="View Details"
            icon={<EyeIcon />}
            onClick={onViewDetails}
            variant="outline"
            heightClass="h-10"
          />
        )}
        {onAddNote && !(denialReason && cardVarient !== "Customer") && (
          <ThemeButton
            label="Add note"
            icon={<NoteIcon />}
            onClick={onAddNote}
            variant="outline"
            heightClass="h-10"
          />
        )}
      </div>
    </div>
  );
};

export default PrescriptionRequestCard;
