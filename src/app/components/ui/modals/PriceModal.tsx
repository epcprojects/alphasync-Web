"use client";

import AppModal from "./AppModal";
import { useState } from "react";
import { InventoryIcon } from "@/icons";
import Image from "next/image";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PriceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    setError("");
  };

  const validateInput = (): boolean => {
    if (!price || price.trim() === "") {
      setError("Percentage is required");
      return false;
    }

    const percentage = parseFloat(price);
    if (isNaN(percentage)) {
      setError("Please enter a valid number");
      return false;
    }

    if (percentage < 0) {
      setError("Percentage cannot be negative");
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

    handleClose();
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
      confirmLabel={"Save"}
      cancelLabel="Cancel"
      confimBtnDisable={!!error}
      outSideClickClose={false}
      headerTooltip="Set the price customers will see and pay."
    >
      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 border flex items-center gap-3 sm:gap-5 border-gray-200 rounded-xl p-2.5">
          <Image
            alt=""
            src={
              "https://cdn.shopify.com/s/files/1/0904/1811/8965/files/ABM-SC-DIHEX-10x30_03345989-23ee-4fa3-9b74-ada8af232649.webp?v=1759262951"
            }
            width={112}
            height={112}
          />
          <h2 className="text-gray-900 text-lg font-medium">
            2X Blend Tesamorelin (10mg) / Ipamorelin (5mg)
          </h2>
        </div>
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
              min="0.01"
              step="0.01"
              value={price}
              onChange={handleChange}
              className={`border ${
                error ? "border-red-500" : "border-gray-200"
              } outline-none bg-white text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:ring-1 block w-full ps-8 p-2.5`}
              placeholder=""
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default PriceModal;
