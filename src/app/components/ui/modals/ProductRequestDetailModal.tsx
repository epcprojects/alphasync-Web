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

// Normalize price from API (can be number, string, or { parsedValue, source })
function normalizeItemPrice(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  const obj = value as { parsedValue?: number; source?: string };
  if (typeof obj?.parsedValue === "number") return obj.parsedValue;
  if (typeof obj?.source === "string") return parseFloat(obj.source) || 0;
  return 0;
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
        const priceToUse =
          item.product?.customPrice != null
            ? item.product.customPrice
            : item.price;
        return sum + normalizeItemPrice(priceToUse);
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
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
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

        {requestData?.requestedItems && requestData.requestedItems.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-gray-800 font-semibold text-sm">Items</h3>
            {requestData.requestedItems.map((item, index) => {
              const description =
                item.product?.description || item.product?.title || "";
              const unit = item.productUnitPricing;
              const unitParts = unit
                ? [
                    unit.quantity != null && `Qty ${unit.quantity}`,
                    unit.strength != null &&
                      unit.strength !== "" &&
                      unit.strength !== "—" &&
                      unit.strength,
                    unit.price != null &&
                      `$${Number(unit.price).toFixed(2)}/unit`,
                  ].filter(Boolean)
                : [];
              const itemPrice = normalizeItemPrice(
                item.product?.customPrice ?? item.price
              );
              return (
                <div
                  key={item.productId ?? index}
                  className="flex gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="w-12 shrink-0 h-12 md:w-14 md:h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Image
                      width={1080}
                      height={1080}
                      className="h-8 md:h-10 w-8 md:w-10"
                      src={
                        item.product?.imageUrl ||
                        requestData?.imageSrc ||
                        "/images/fallbackImages/medicine-syrup.svg"
                      }
                      alt={item.title || ""}
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h2 className="text-gray-800 font-semibold text-xs md:text-sm">
                      {item.title || "Product"}
                    </h2>
                    <div className="text-[10px] md:text-xs text-gray-800 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:my-0.5">
                      {description ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: description,
                          }}
                        />
                      ) : (
                        <span className="text-gray-500">No description</span>
                      )}
                    </div>
                    <div className="mt-1 pt-1 border-t border-gray-200">
                      <p className="text-[10px] md:text-xs text-gray-600 font-medium">
                        Pricing
                      </p>
                      {unit ? (
                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                          <span className="font-medium text-gray-600">
                            Unit pricing:{" "}
                          </span>
                          {unitParts.length > 0
                            ? unitParts.join(" · ")
                            : "—"}
                        </p>
                      ) : null}
                      <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-600">
                          {unit ? "Item price: " : "Price: "}
                        </span>
                        ${itemPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
