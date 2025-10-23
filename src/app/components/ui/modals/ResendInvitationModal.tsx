"use client";
import React from "react";
import AppModal from "./AppModal";
import { MailIcon } from "@/icons";
import { useMutation } from "@apollo/client";
import { RESEND_INVITATION } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface ResendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  doctorId?: string | number;
  onSuccess?: () => void;
}

const ResendInvitationModal: React.FC<ResendInvitationModalProps> = ({
  isOpen,
  onClose,
  doctorName,
  doctorId,
  onSuccess,
}) => {
  const [resendInvitation, { loading }] = useMutation(RESEND_INVITATION);

  const handleConfirm = async () => {
    if (!doctorId) return;

    try {
      await resendInvitation({
        variables: {
          id: doctorId,
        },
      });

      showSuccessToast("Invitation resent successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error resending invitation:", error);
      showErrorToast("Failed to resend invitation. Please try again.");
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Resend Invitation"
      onConfirm={handleConfirm}
      confirmLabel={loading ? "Sending..." : "Resend Invitation"}
      icon={<MailIcon />}
      size="small"
      outSideClickClose={true}
      onCancel={onClose}
      cancelLabel="Cancel"
      confimBtnDisable={loading}
    >
      <div className="flex flex-col gap-4">
        <p className="text-gray-700 text-sm">
          Are you sure you want to resend the invitation to{" "}
          <span className="font-semibold">{doctorName || "this doctor"}</span>?
        </p>
        <p className="text-gray-500 text-xs">
          A new invitation email will be sent to the doctor's email address.
        </p>
      </div>
    </AppModal>
  );
};

export default ResendInvitationModal;

