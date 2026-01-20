"use client";

import AppModal from "./AppModal";
import ThemeInput from "../inputs/ThemeInput";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { BLANKET_MARKUP_PRODUCTS } from "@/lib/graphql/mutations";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { PackageOutlineIcon } from "@/icons";

interface BlanketMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BlanketMarkupModal: React.FC<BlanketMarkupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [markupPercentage, setMarkupPercentage] = useState("");
  const [error, setError] = useState("");
  const [blanketMarkupProducts, { loading }] = useMutation(
    BLANKET_MARKUP_PRODUCTS,
    {
      refetchQueries: [{ query: ALL_PRODUCTS_INVENTORY }],
    }
  );

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, numbers, and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      // Check if value exceeds 1000
      if (value !== "" && parseFloat(value) > 1000) {
        setError("Percentage cannot exceed 1000");
        return;
      }
      setMarkupPercentage(value);
      setError("");
    }
  };

  const validateInput = (): boolean => {
    if (!markupPercentage || markupPercentage.trim() === "") {
      setError("Percentage is required");
      return false;
    }

    const percentage = parseFloat(markupPercentage);
    if (isNaN(percentage)) {
      setError("Please enter a valid number");
      return false;
    }

    if (percentage < 0) {
      setError("Percentage cannot be negative");
      return false;
    }

    if (percentage > 1000) {
      setError("Percentage cannot exceed 1000");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    try {
      const percentage = parseFloat(markupPercentage);
      const { data } = await blanketMarkupProducts({
        variables: {
          markupPercentage: percentage,
        },
      });

      if (data?.blanketMarkupProducts?.success) {
        showSuccessToast("Products marked up successfully!");
        setMarkupPercentage("");
        setError("");
        onSuccess?.();
        onClose();
      } else {
        showErrorToast("Failed to apply markup. Please try again.");
      }
    } catch (error) {
      console.error("Error applying blanket markup:", error);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to apply markup. Please try again."
      );
    }
  };

  const handleClose = () => {
    setMarkupPercentage("");
    setError("");
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<PackageOutlineIcon height={"20"} width={"20"} />}
      title="Apply Blanket Markup"
      subtitle="Enter the markup percentage to apply to all products"
      size="small"
      onConfirm={handleSubmit}
      confirmLabel={loading ? "Applying..." : "Apply Markup"}
      cancelLabel="Cancel"
      confimBtnDisable={loading || !markupPercentage || !!error}
      outSideClickClose={!loading}
    >
      <div className="flex flex-col gap-4">
        <ThemeInput
          id="markupPercentage"
          label="Markup Percentage"
          name="markupPercentage"
          type="text"
          placeholder="e.g., 10.5"
          value={markupPercentage}
          onChange={handlePercentageChange}
          onBlur={validateInput}
          error={!!error}
          errorMessage={error}
          required
        />
        <p className="text-sm text-gray-500">
          Enter a percentage value between 0 and 1000 (e.g., 10 for 10%, 150 for
          150%)
        </p>
      </div>
    </AppModal>
  );
};

export default BlanketMarkupModal;
