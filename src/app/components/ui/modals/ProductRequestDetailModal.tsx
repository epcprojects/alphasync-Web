import React from "react";
import AppModal from "./AppModal";
import { ShopingCartIcon } from "@/icons";
import Image from "next/image";
import type { RequestedItem } from "@/lib/graphql/attributes";

interface ProductRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  requestData?: {
    title?: string;
    subtitle?: string;
    description?: string;
    status?: string;
    requestedDate?: string;
    price?: string;
    doctorName?: string;
    reason?: string;
    imageSrc?: string;
    requestCustomPrice?: string | number;
    requestedItems?: RequestedItem[];
  };
}

const ProductRequestDetailModal: React.FC<ProductRequestDetailModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  requestData,
}) => {
  const handleClose = () => {
    onClose();
  };

  // Calculate price with fallback logic: requestCustomPrice -> customPrice -> price
  const calculatedPrice = React.useMemo<string>(() => {
    // Priority: requestCustomPrice -> customPrice -> price
    if (
      requestData?.requestCustomPrice !== undefined &&
      requestData?.requestCustomPrice !== null
    ) {
      const priceValue =
        typeof requestData.requestCustomPrice === "string"
          ? parseFloat(requestData.requestCustomPrice)
          : (requestData.requestCustomPrice as number) || 0;
      return `$${priceValue.toFixed(2)}`;
    }
    // Fallback to calculating from items
    if (requestData?.requestedItems && requestData.requestedItems.length > 0) {
      const totalAmount = requestData.requestedItems.reduce((sum, item) => {
        const priceToUse = item.product?.customPrice || item.price;
        const itemPrice =
          typeof priceToUse === "string"
            ? parseFloat(priceToUse)
            : (priceToUse as number) || 0;
        return sum + itemPrice;
      }, 0);
      return `$${totalAmount.toFixed(2)}`;
    }
    // Fallback to passed price prop
    return requestData?.price || "$0.00";
  }, [requestData]);

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
              src={
                requestData?.imageSrc ||
                "/images/fallbackImages/medicine-syrup.svg"
              }
              alt={requestData?.title || ""}
              unoptimized
            />
          </div>
          <div className="flex items-start gap-0.5 md:gap-2 flex-col">
            <h2 className="text-gray-800 font-semibold text-xs md:text-sm">
              {requestData?.title || "Product Request"}
            </h2>

            <p className="text-[10px] md:text-xs text-gray-800">
              {requestData?.description ||
                requestData?.subtitle ||
                "No description"}
            </p>

            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-xs font-medium ${
                  requestData?.status === "Approved"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : requestData?.status === "Denied"
                    ? "bg-red-50 border border-red-200 text-red-500"
                    : "bg-amber-50 border border-amber-200 text-amber-700"
                }`}
              >
                {requestData?.status || "Pending Review"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg md:py-3 md:px-4 px-2 py-1 flex flex-col gap-2 md:gap-3">
          <div className="flex items-center justify-between">
            <span className="block text-xs md:text-sm text-gray-800 font-normal">
              Doctor Name:
            </span>
            <span className="block text-xs md:text-sm text-gray-800 font-medium">
              {requestData?.doctorName || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="block text-xs md:text-sm text-gray-800 font-normal">
              Requested:
            </span>
            <span className="block text-xs md:text-sm text-gray-800 font-medium">
              {requestData?.requestedDate || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="block text-sm md:text-base text-gray-800 font-medium">
              Price
            </span>
            <span className="block text-sm md:text-base text-primary font-semibold">
              {calculatedPrice}
            </span>
          </div>
        </div>

        {requestData?.reason && (
          <>
            <hr className=" text-gray-200" />
            <div className="w-full">
              <h2 className="text-gray-900 mb-1.5 font-medium text-xs md:text-sm">
                Reason:
              </h2>
              <div className="bg-porcelan p-1.5 md:p-3 rounded-lg w-full">
                <p className="text-[10px] md:text-xs text-gray-600">
                  {requestData.reason}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AppModal>
  );
};

export default ProductRequestDetailModal;
