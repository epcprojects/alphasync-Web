"use client";
import React, { useState } from "react";
import { AppModal, CustomerSelect } from "@/components";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    customer: string;
    price: number;
    productId?: string;
    shopifyVariantId?: string;
    customerId?: string;
  }) => void;
  productId?: string;
  shopifyVariantId?: string;
  defaultPrice?: number;
  isLoading?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productId,
  shopifyVariantId,
  defaultPrice,
  isLoading = false,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<{ user?: string; price?: string }>({});
  const [selectedCustomerData, setSelectedCustomerData] = useState<{
    name: string;
    displayName: string;
    email: string;
    id: string;
  } | null>(null);

  // Auto-populate price when defaultPrice changes
  React.useEffect(() => {
    if (defaultPrice && defaultPrice > 0) {
      setPrice(defaultPrice.toString());
    }
  }, [defaultPrice]);

  const handleClose = () => {
    setSelectedUser("");
    setPrice("");
    setErrors({});
    setSelectedCustomerData(null);
    onClose();
  };

  const handleConfirm = () => {
    const newErrors: { user?: string; price?: string } = {};

    if (!selectedUser) {
      newErrors.user = "Please select a customer.";
    }

    if (!price) {
      newErrors.price = "Please enter a price.";
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be greater than 0.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onConfirm({
        customer: selectedUser,
        price: Number(price),
        productId,
        shopifyVariantId,
        customerId: selectedCustomerData?.id,
      });
      // Don't close modal here - let the parent handle it after successful mutation
    }
  };

  if (!isOpen) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Order"
      onConfirm={handleConfirm}
      outSideClickClose={false}
      confirmLabel={isLoading ? "Creating Order..." : "Create Order"}
      confimBtnDisable={
        !selectedUser || !price || Number(price) <= 0 || isLoading
      }
      scrollNeeded={false}
    >
      <div className="w-full flex flex-col justify-between  md:min-h-20 gap-4">
        {/* Customer Selection */}
        <div>
          <CustomerSelect
            selectedCustomer={selectedUser}
            setSelectedCustomer={(customer) => {
              setErrors({});
              setSelectedUser(customer);
            }}
            errors={errors.user || ""}
            touched={!!errors.user}
            placeholder="Select Customer"
            required={true}
            showLabel={true}
            paddingClasses="py-1 px-2"
            optionPaddingClasses="p-1"
            onCustomerChange={(customer) => {
              setSelectedCustomerData(customer);
            }}
          />
          {errors.user && (
            <p className="text-red-500 text-xs mt-1">{errors.user}</p>
          )}
        </div>

        {/* Price Input */}
        <div>
          <label
            htmlFor="input-group-1"
            className="block mb-1 text-sm font-medium text-gray-900"
          >
            Price to Customer ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 text-gray-400 start-0 flex items-center ps-3.5 pointer-events-none">
              $
            </div>
            <input
              type="number"
              id="input-group-1"
              disabled={true}
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors({});
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className={`border ${
                errors.price ? "border-red-500" : "border-gray-200"
              } outline-none bg-white text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:ring-1 block w-full ps-8 p-2.5`}
              placeholder=""
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default OrderModal;
