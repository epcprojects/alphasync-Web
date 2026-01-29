"use client";

import AppModal from "./AppModal";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { InventoryIcon } from "@/icons";
import Image from "next/image";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { UPDATE_PRODUCT_PRICE } from "@/lib/graphql/mutations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: {
    id: string; // GraphQL product id
    title: string;
    imageUrl?: string | null;
    basePrice: number; // base/clinic price
    customPrice?: number | null;
  } | null;
}

const PriceModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const [updateProductPrice, { loading: updating }] = useMutation(UPDATE_PRODUCT_PRICE);

  useEffect(() => {
    if (!isOpen) return;
    // Prefill with current customPrice if present
    const initial =
      product?.customPrice != null && product.customPrice !== undefined
        ? String(product.customPrice)
        : "";
    setPrice(initial);
    setError("");
  }, [isOpen, product?.customPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    setError("");
  };

  const validateInput = (): boolean => {
    if (!product) {
      setError("Product information is missing");
      return false;
    }
    if (!price || price.trim() === "") {
      setError("Customer price is required");
      return false;
    }

    const customerPrice = parseFloat(price);
    if (isNaN(customerPrice)) {
      setError("Please enter a valid number");
      return false;
    }

    if (customerPrice <= 0) {
      setError("Customer price must be greater than 0");
      return false;
    }

    if (customerPrice <= product.basePrice) {
      setError(
        `Customer price must be greater than base price ($${product.basePrice.toFixed(2)})`
      );
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
      if (!product) return;
      const customerPrice = parseFloat(price);
      await updateProductPrice({
        variables: {
          productId: product.id,
          price: customerPrice,
        },
      });
      showSuccessToast("Customer price updated successfully");
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Failed to update product price:", err);
      showErrorToast("Failed to update customer price. Please try again.");
    }
  };

  const handleClose = () => {
    setPrice("");
    setError("");
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<InventoryIcon fill="#2862A9" height={"20"} width={"20"} />}
      title="Set Customer Price"
      size="small"
      onConfirm={handleSubmit}
      confirmLabel={updating ? "Saving..." : "Save"}
      cancelLabel="Cancel"
      confimBtnDisable={!!error || updating || !product}
      outSideClickClose={false}
      headerTooltip="Set the price customers will see and pay."
      disableCloseButton={updating}
    >
      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 border flex items-center gap-3 sm:gap-5 border-gray-200 rounded-xl p-2.5">
          {product?.imageUrl ? (
            <Image alt="" src={product.imageUrl} width={112} height={112} />
          ) : (
            <div className="h-28 w-28 bg-gray-200 rounded-lg" />
          )}
          <h2 className="text-gray-900 text-lg font-medium">
            {product?.title || "Product"}
          </h2>
        </div>
        {product && (
          <p className="text-sm text-gray-600">
            Base price: <span className="font-semibold">${product.basePrice.toFixed(2)}</span>
          </p>
        )}
        <div>
          <label
            htmlFor="input-group-1"
            className="block mb-1 text-sm font-medium text-gray-900"
          >
            Price to Customer ($)
          </label>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 text-gray-400 start-0 flex items-center ps-3.5 pointer-events-none">
                $
              </div>
              <input
                type="number"
                id="input-group-1"
                min={product ? (product.basePrice + 0.01).toFixed(2) : "0.01"}
                step="0.01"
                value={price}
                onChange={handleChange}
                disabled={updating || !product}
                className={`border ${error ? "border-red-500" : "border-gray-200"
                  } outline-none bg-white text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:ring-1 block w-full ps-8 p-2.5`}
                placeholder=""
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default PriceModal;
