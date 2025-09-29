import React, { useState } from "react";
import AppModal from "./AppModal";
import { CreditCardOutlineIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface RequestModelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string }) => void;
}

const RequestModel: React.FC<RequestModelProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    onClose();
    setReason(""); // reset on close
  };

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm({ reason });
      setReason(""); // reset after confirm
      onClose();
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reason of Request"
      onConfirm={handleConfirm}
      confirmLabel="Send Request"
      outSideClickClose={false}
      icon={<CreditCardOutlineIcon />}
      confimBtnDisable={!reason.trim()}
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
