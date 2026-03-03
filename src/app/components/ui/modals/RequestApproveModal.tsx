"use client";
import React, { useState, useEffect } from "react";
import AppModal from "./AppModal";
import { ApproveCheckIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";
import ThemeInput from "../inputs/ThemeInput";

interface RequestApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { doctorMessage: string; consultationFee?: number }) => void;
  itemTitle?: string;
  isSubmitting?: boolean;
  /** When true, show consultation fee field (for pharmacy/Integrity requests) */
  isPharmacyRequest?: boolean;
}

const RequestApproveModal: React.FC<RequestApproveModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  onConfirm,
  isSubmitting = false,
  isPharmacyRequest = false,
}) => {
  const [doctorMessage, setDoctorMessage] = useState("");
  const [consultationFeeInput, setConsultationFeeInput] = useState("");

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDoctorMessage("");
      setConsultationFeeInput("");
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isSubmitting) {
      setDoctorMessage("");
      setConsultationFeeInput("");
      onClose();
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setDoctorMessage("");
      setConsultationFeeInput("");
      onClose();
    }
  };

  const handleConfirm = () => {
    const consultationFee =
      isPharmacyRequest && consultationFeeInput.trim() !== ""
        ? parseFloat(consultationFeeInput) || 0
        : undefined;
    onConfirm({ doctorMessage, consultationFee });
  };

  const consultationFeeValue = parseFloat(consultationFeeInput) || 0;
  const confirmDisabled =
    isSubmitting ||
    (isPharmacyRequest && consultationFeeValue <= 0);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      onCancel={handleCancel}
      title="Approve Patient Request"
      onConfirm={handleConfirm}
      confirmLabel={isSubmitting ? "Approving..." : "Approve Request"}
      icon={<ApproveCheckIcon />}
      confirmBtnVarient="success"
      outSideClickClose={false}
      subtitle={`Approve request ${itemTitle} for patient`}
      confimBtnDisable={confirmDisabled}
      disableCloseButton={isSubmitting}
    >
      <div className="flex flex-col gap-3">
        {isPharmacyRequest && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Consultation fee ($) <span className="text-red-500">*</span>
            </label>
            <ThemeInput
              type="number"
              placeholder="0.00"
              value={consultationFeeInput}
              onChange={(e) => setConsultationFeeInput(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        <TextAreaField
          label="Message (Optional)"
          value={doctorMessage}
          onChange={(e) => setDoctorMessage(e.target.value)}
          placeholder="Add any additional message or notes..."
        />
      </div>
    </AppModal>
  );
};

export default RequestApproveModal;
