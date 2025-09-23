import React, { useState } from "react";
import { AppModal, SelectGroupDropdown } from "@/components";

type Customer = {
  name: string;
  displayName: string;
  email: string;
};

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { customer: string; price: number }) => void;
  customers: Customer[];
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customers,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<{ user?: string; price?: string }>({});

  const handleGroupSelect = (user: string | string[]) => {
    const userSelected = Array.isArray(user) ? user[0] : user;
    setErrors({});
    setSelectedUser(userSelected);
  };

  const handleClose = () => {
    setSelectedUser("");
    setPrice("");
    setErrors({});
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
      onConfirm({ customer: selectedUser, price: Number(price) });
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Order"
      onConfirm={handleConfirm}
      confirmLabel="Create Order"
    >
      <div className="w-full flex flex-col justify-between min-h-40 gap-4">
        {/* Customer Selection */}
        <div>
          <SelectGroupDropdown
            selectedGroup={selectedUser}
            setSelectedGroup={handleGroupSelect}
            groups={customers}
            errors={errors.user || ""}
            name="Select Customer"
            multiple={false}
            placeholder="Select User:"
            searchTerm={""}
            setSearchTerm={() => {}}
            isShowDrop={true}
            required={false}
            paddingClasses="py-1 px-2"
            optionPaddingClasses="p-1"
            showLabel={true}
            showIcon
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
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors({});
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
