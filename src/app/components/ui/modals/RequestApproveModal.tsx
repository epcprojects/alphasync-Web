"use client";
import React, { useState } from "react";
import AppModal from "./AppModal";
import { ApproveCheckIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface RequestApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { doctorMessage: string }) => void;
  itemTitle?: string;
  isSubmitting?: boolean;
}

const RequestApproveModal: React.FC<RequestApproveModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  onConfirm,
  isSubmitting = false,
}) => {
  const [doctorMessage, setDoctorMessage] = useState("");

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setDoctorMessage(""); // reset on close
    }
  };

  const handleConfirm = () => {
    onConfirm({ doctorMessage });
    // Don't close here - let parent component handle it
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Approve Patient Request"
      onConfirm={handleConfirm}
      confirmLabel={isSubmitting ? "Approving..." : "Approve Request"}
      icon={<ApproveCheckIcon />}
      confirmBtnVarient="success"
      outSideClickClose={false}
      subtitle={`Approve request ${itemTitle} for patient`}
      confimBtnDisable={isSubmitting}
      disableCloseButton={isSubmitting}
    >
      <TextAreaField
        label="Message (Optional)"
        value={doctorMessage}
        onChange={(e) => setDoctorMessage(e.target.value)}
        placeholder="Add any additional message or notes..."
      />
    </AppModal>
  );
};

export default RequestApproveModal;
