"use client";
import React, { useState } from "react";
import AppModal from "./AppModal";
import { UserRejectIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface RequestRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string }) => void;
  itemTitle?: string;
  isSubmitting?: boolean;
}

const RequestRejectModal: React.FC<RequestRejectModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  onConfirm,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setReason(""); // reset on close
    }
  };

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm({ reason });
      // Don't close here - let parent component handle it
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deny Patient Request"
      onConfirm={handleConfirm}
      confirmLabel={isSubmitting ? "Denying..." : "Deny Request"}
      icon={<UserRejectIcon />}
      confirmBtnVarient="danger"
      outSideClickClose={false}
      subtitle={`Please provide a reason for denying request ${itemTitle}`}
      confimBtnDisable={!reason.trim() || isSubmitting}
      disableCloseButton={isSubmitting}
    >
      <TextAreaField
        label="Denial Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Please explain why this request is being denied..."
      />
    </AppModal>
  );
};

export default RequestRejectModal;
