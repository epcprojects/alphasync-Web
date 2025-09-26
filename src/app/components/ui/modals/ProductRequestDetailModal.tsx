import React from "react";
import AppModal from "./AppModal";
import { ShopingCartIcon } from "@/icons";
import Image from "next/image";

interface ProductRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
}

const ProductRequestDetailModal: React.FC<ProductRequestDetailModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
}) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request details"
      icon={<ShopingCartIcon fill="#374151" width={16} height={16} />}
      subtitle={`Request ID #${itemTitle}`}
      outSideClickClose={false}
      showFooter={false}
      size="large"
    >
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-3">
          <div className="w-12 shrink-0 h-12 md:w-18 md:h-18 rounded-lg bg-gray-100 flex items-center justify-center">
            <Image
              width={1080}
              height={1080}
              className="h-10 md:h-16 md:w-16 w-10"
              src={"/images/products/bpc-157.png"}
              alt={""}
            />
          </div>
          <div className="flex items-start gap-0.5 md:gap-2 flex-col">
            <h2 className="text-gray-800 font-semibold text-xs md:text-sm">
              2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)
            </h2>

            <p className="text-[10px] md:text-xs text-gray-800">
              A 1:1 blend of CJC-1295 No DAC (5mg) and Ipamorelin (5mg)
            </p>

            <div>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-xs md:text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700">
                Pending Review
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg md:py-3 md:px-4 px-2 py-1 flex flex-col gap-2 md:gap-3">
          <div className="flex items-center justify-between">
            <span className="block text-xs md:text-sm text-gray-800 font-normal">
              Strength:
            </span>
            <span className="block text-xs md:text-sm text-gray-800 font-medium">
              5 mg vial
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="block text-xs md:text-sm text-gray-800 font-normal">
              Dosage Form:
            </span>
            <span className="block text-xs md:text-sm text-gray-800 font-medium">
              Injectable
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="block text-xs md:text-sm text-gray-800 font-normal">
              Doctor Name:
            </span>
            <span className="block text-xs md:text-sm text-gray-800 font-medium">
              Dr. Sarah Mitchell
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="block text-xs md:text-sm text-gray-800 font-normal">
              Requested:
            </span>
            <span className="block text-xs md:text-sm text-gray-800 font-medium">
              8/8/2025
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="block text-sm md:text-base text-gray-800 font-medium">
              Price
            </span>
            <span className="block text-sm md:text-base text-primary font-semibold">
              $20.99
            </span>
          </div>
        </div>

        <hr className=" text-gray-200" />

        <div className="w-full">
          <h2 className="text-gray-900 mb-1.5 font-medium text-xs md:text-sm">
            Your Notes:
          </h2>
          <div className="bg-porcelan p-1.5 md:p-3 rounded-lg w-full">
            <p className="text-[10px] md:text-xs text-gray-600">
              Requesting this for a recent shoulder injury that&apos;s been slow
              to heal. Been dealing with inflammation and limited mobility for 3
              weeks.
            </p>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default ProductRequestDetailModal;
