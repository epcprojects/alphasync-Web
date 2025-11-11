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
import type { NoteAttributes } from "@/lib/graphql/attributes";
import InfoGrid from "./InfoGrid";
import { useIsMobile } from "@/hooks/useIsMobile";

export type cardVariantType = "Customer" | "Doctor";
type UserNote = NoteAttributes;

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
  userNotes?: UserNote[];
  physicianNotes?: string;
  customerReason?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onChat?: () => void;
  onPayment?: () => void;
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
  customerReason,
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
    " flex-col flex items-start gap-1.5 md:gap-3  bg-white p-2 lg:p-4";

  const variantClasses: Record<cardVariantType, string> = {
    Customer: "border-b border-b-gray-200 last:border-b-0",
    Doctor: "border border-gray-200 rounded-xl",
  };

  const isMobile = useIsMobile();
  console.log("userNotes", userNotes);

  return (
    <div className={`${baseClasses} ${variantClasses[cardVarient]}`}>
      <div className="w-full">
        <div className="w-full flex items-start gap-2.5 md:gap-4">
          <div className="w-14 shrink-0 h-14 md:w-20 md:h-20 rounded-lg bg-gray-100 flex items-center justify-center">
            <Image
              width={1080}
              height={1080}
              className="h-12 md:h-18 md:w-18 w-12 object-cover"
              src={imageSrc}
              alt={title ? title : ""}
            />
          </div>

          <div className="w-full flex flex-col gap-0.5 md:gap-1">
            <div className="flex items-start sm:flex-row flex-col justify-between gap-1.5 md:gap-3 ">
              <div>
                <h2 className="text-gray-800 font-semibold text-sm mb-1 md:text-base">
                  {title}{" "}
                  {subtitle && (
                    <span className="font-normal text-xs">{subtitle}</span>
                  )}
                </h2>
                {description && (
                  <p
                    className="text-[10px] md:text-xs mb-1.5 text-gray-800"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
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
            {!isMobile && (
              <InfoGrid
                category={category}
                requestedDate={requestedDate}
                reviewedDate={reviewedDate}
                doctorName={doctorName}
                price={price}
              />
            )}
          </div>
        </div>
        {isMobile && (
          <InfoGrid
            category={category}
            requestedDate={requestedDate}
            reviewedDate={reviewedDate}
            doctorName={doctorName}
            price={price}
          />
        )}
      </div>
      {cardVarient === "Customer" &&
        Array.isArray(userNotes) &&
        userNotes.length > 0 && (
          <div className="w-full">
            <h2 className="text-gray-900 mb-1.5 font-medium text-xs md:text-sm">
              Your Notes:
            </h2>
            <div>
              {userNotes.map((note, index) => (
                <div
                  className="bg-porcelan p-1.5 md:p-3 rounded-lg w-full mb-2"
                  key={index}
                >
                  <div className="text-xs sm:text-sm md:text-base text-gray-600">
                    {note?.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {physicianNotes && (
        <div className="w-full">
          <h2 className="text-gray-900  mb-1.5 font-medium text-xs md:text-sm">
            Physician Notes:
          </h2>
          <div
            className={
              status === "Denied"
                ? "bg-red-100 p-1.5 md:p-3 rounded-lg w-full"
                : "bg-porcelan p-1.5 md:p-3 rounded-lg w-full"
            }
          >
            <p
              className={
                status === "Denied"
                  ? "text-xs sm:text-sm md:text-base font-medium text-red-900"
                  : "text-xs sm:text-sm md:text-base text-gray-600"
              }
            >
              {physicianNotes}
            </p>
          </div>
        </div>
      )}

      {customerReason && (
        <div className="w-full">
          <h2 className="text-gray-900  mb-1.5 font-medium text-xs md:text-sm">
            Request Reason:
          </h2>
          <div className="bg-porcelan p-1.5 md:p-3 rounded-lg w-full">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {customerReason}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center flex-col sm:flex-row justify-end gap-1 w-full md:gap-2">
        {onApprove &&
          status === "Pending Review" &&
          cardVarient === "Doctor" && (
            <ThemeButton
              label="Approve"
              icon={<ApproveCheckIcon />}
              onClick={onApprove}
              variant="outline"
              heightClass="h-10"
              className="w-full sm:w-fit"
            />
          )}
        {onReject &&
          cardVarient === "Doctor" &&
          status === "Pending Review" && (
            <ThemeButton
              label="Reject"
              icon={<RejectIcon />}
              onClick={onReject}
              variant="outline"
              heightClass="h-10"
              className="w-full sm:w-fit"
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
              className="w-full sm:w-fit"
            />
          )}

        {cardVarient === "Customer" && status === "Approved" && (
          <ThemeButton
            label="Proceed to Payment"
            icon={<CreditCardOutlineIcon />}
            onClick={onPayment}
            heightClass="h-10"
            className="w-full sm:w-fit"
          />
        )}

        {onViewDetails && (
          <ThemeButton
            label="View Details"
            icon={<EyeIcon />}
            onClick={onViewDetails}
            variant="outline"
            heightClass="h-10"
            className="w-full sm:w-fit"
          />
        )}
        {onAddNote &&
          status !== "Approved" &&
          !(customerReason && cardVarient !== "Customer") && (
            <ThemeButton
              label="Add note"
              icon={<NoteIcon />}
              onClick={onAddNote}
              variant="outline"
              heightClass="h-10"
              className="w-full sm:w-fit"
            />
          )}
      </div>
    </div>
  );
};

export default PrescriptionRequestCard;
