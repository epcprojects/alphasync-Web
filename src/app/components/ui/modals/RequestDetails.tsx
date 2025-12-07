import React from "react";
import AppModal, { ModalPosition } from "./AppModal";
import { BubbleChatIcon, ShopingCartIcon } from "@/icons";
import OrderItemCard from "../cards/OrderItemCards";
import Card from "../../../../../public/icons/Card";

interface requestDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  request: requestDetails | null;
  onClick: () => void;
  oncancel?: () => void;
}

export type requestDetails = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
  requestedDate?: string;
  reviewedDate?: string;
  doctorName?: string;
  doctorId?: string;
  price?: string;
  userNotes?: string;
  physicianNotes?: string;
  denialReason?: string;
  category?: string;
  displayId?: string;
};

const RequestDetails: React.FC<requestDetailsProps> = ({
  isOpen,
  onClose,
  request,
  onClick,
  oncancel,
}) => {
  if (!request) return null;
  console.log("request in model", request);
  const transformedItem =
    request && request.price
      ? {
          id: request.id,
          medicineName: request.title,
          amount: request.category ?? "N/A",
          price: parseFloat(request.price.replace(/[^0-9.-]+/g, "")),
          quantity: 1,
          status: request.status,
          strength: request.subtitle,
          doctorName: request.doctorName,
          requestedOn: request.requestedDate,
          userNotes: request.userNotes,
          physicianNotes: request.physicianNotes,
          denialReason: request.denialReason,
          description: request.description,
        }
      : null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<ShopingCartIcon fill="#374151" />}
      title="Request details"
      subtitle="Request ID #REQ-001"
      position={ModalPosition.RIGHT}
      showFooter={true}
      hideConfirmButton={request.status === "Approved" ? false : true}
      hideCancelBtn={
        request.status === "Approved" || request.status === "Denied"
          ? true
          : false
      }
      cancelLabel="Follow up with Physician"
      onConfirm={onClick}
      onCancel={oncancel}
      outSideClickClose={false}
      btnIcon={<Card fill="#fff" />}
      confirmLabel="Proceed to Payment"
      btnFullWidth={true}
      cancelBtnIcon={<BubbleChatIcon fill="#000" />}
    >
      {transformedItem && (
        <OrderItemCard
          key={transformedItem.id}
          item={transformedItem}
          requestStatus={true}
        />
      )}
    </AppModal>
  );
};

export default RequestDetails;
