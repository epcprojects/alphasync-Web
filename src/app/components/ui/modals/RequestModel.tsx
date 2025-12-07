import React, { useState } from "react";
import AppModal from "./AppModal";
import { CreditCardOutlineIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface RequestModelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string }) => void | Promise<void>;
}

const RequestModel: React.FC<RequestModelProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onClose();
    setReason(""); // reset on close
  };

  const handleConfirm = async () => {
    if (reason.trim()) {
      setIsSubmitting(true);
      try {
        await onConfirm({ reason });
        setReason(""); // reset after confirm
        // Don't close here - let parent component handle it
      } catch (error) {
        console.error("Error in onConfirm:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reason of Request"
      onConfirm={handleConfirm}
      confirmLabel={isSubmitting ? "Sending Request..." : "Send Request"}
      outSideClickClose={false}
      icon={<CreditCardOutlineIcon />}
      confimBtnDisable={!reason.trim() || isSubmitting}
    >
      <TextAreaField
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Please explain to the physician why you think this product would benefit you"
      />
    </AppModal>
  );
};

export default RequestModel;
