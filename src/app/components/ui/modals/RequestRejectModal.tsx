import React from "react";
import AppModal from "./AppModal";
import { UserRejectIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { customer: string; price: number }) => void;
  itemTitle?: string;
}

const RequestRejectModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  //   onConfirm,
}) => {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {};

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deny Patient Request"
      onConfirm={handleConfirm}
      confirmLabel="Deny Request"
      icon={<UserRejectIcon />}
      confirmBtnVarient="danger"
      subtitle={`Please provide a reason for denying request ${itemTitle}`}
    >
      <TextAreaField
        label="Denial Reason"
        value={""}
        onChange={(e) => {}}
        placeholder="Please explain why this request is being denied..."
      />
    </AppModal>
  );
};

export default RequestRejectModal;
