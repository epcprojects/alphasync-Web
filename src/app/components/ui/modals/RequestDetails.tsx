import React, { useEffect } from "react";
import AppModal, { ModalPosition } from "./AppModal";
import { ShopingCartIcon } from "@/icons";
import OrderItemCard from "../cards/OrderItemCards";

interface requestDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  request: requestDetails | null;
  onClick: () => void;
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
  price?: string;
  userNotes?: string;
  physicianNotes?: string;
  denialReason?: string;
  category?: string;
};

const RequestDetails: React.FC<requestDetailsProps> = ({
  isOpen,
  onClose,
  request,
  onClick,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!request) return null;
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
        }
      : null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<ShopingCartIcon fill="#374151" />}
      title="Product Details"
      position={ModalPosition.RIGHT}
      showFooter={false}
    >
      {transformedItem && (
        <OrderItemCard key={transformedItem.id} item={transformedItem} requestStatus={true} onClick={onClick} />
      )}
    </AppModal>
  );
};

export default RequestDetails;
