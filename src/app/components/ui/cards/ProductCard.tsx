"use client";

import {
  HeartFilledIcon,
  HeartOutlineIcon,
  ShopingCartIcon,
  CrossIcon,
  InventoryIcon,
} from "@/icons";
import { Switch } from "@headlessui/react";
import ThemeButton from "../buttons/ThemeButton";
import ProductImage from "@/app/components/ui/ProductImage";
import Tooltip from "../tooltip";

type Product = {
  id: number;
  originalId?: string;
  title: string;
  description: string;
  category: string;
  stock: boolean;
  price: string;
  image: string;
  isFavourite: boolean;
  tags?: string[];
  basePrice?: string;
};

interface ProductCardProps {
  product: Product;
  onBtnClick?: (id: number) => void;
  onCardClick?: () => void;
  onRemoveFromSale?: (productId: string) => void;
  customPrice?: number | null;
  /** When true, disables Add to  / Change Customer Price (e.g. only RUO products can be ordered) */
  orderButtonDisabled?: boolean;
  orderButtonDisabledTooltip?: string;
  /** When not "Alpha BioMed", rx-placeholder is used as image fallback */
  vendor?: string | null;
  /** When true, show "Pending approval" text (e.g. for non–Alpha BioMed products) */
  pendingApproval?: boolean;
  /** When true, show "My Store" toggle instead of Add to My Store / Change Customer Price button */
  useAddToStoreToggle?: boolean;
  /** Numeric price shown on the card (used when enabling toggle to call UpdateProductPrice) */
  displayPriceValue?: number;
  /** When toggle is turned on, call with productId and displayPriceValue to add to store without modal */
  onAddToStoreWithPrice?: (productId: string, price: number) => void;
}

export default function ProductCard({
  product,
  onBtnClick,
  onCardClick,
  onRemoveFromSale,
  customPrice,
  orderButtonDisabled = false,
  vendor,
  pendingApproval = false,
  useAddToStoreToggle = false,
  displayPriceValue,
  onAddToStoreWithPrice,
  // orderButtonDisabledTooltip = "Only RUO products can be added to your shop.",
}: ProductCardProps) {
  const productId = product.originalId || String(product.id);
  const isMarkedUp = customPrice != null && customPrice !== undefined;
  return (
    <div
      onClick={onCardClick}
      className="rounded-2xl pb-2 cursor-pointer flex-col bg-white shadow-table border  border-gray-200 px-2 flex items-center justify-center"
    >
      <div className="bg-[url(/images/productBgPattern.png)] bg-cover h-52 md:h-60 pt-3 pb-2 bg-[position:0_20px] flex items-center justify-center ">
        <ProductImage
          width={240}
          height={240}
          src={product.image}
          alt={product.title}
          vendor={vendor}
        />
      </div>

      <div className="bg-gray-50 border border-gray-100 p-2 md:p-4 md:min-h-64 md:max-h-64 w-full rounded-lg">
        <div className="flex flex-col gap-2 h-full justify-between">
          <div className="flex flex-col gap-1">
            {pendingApproval && (
              <span className="block w-fit rounded-full bg-amber-100 border border-amber-300 py-0.5 px-2.5 text-amber-800 font-medium text-xs md:text-sm">
                Pending approval
              </span>
            )}
            <h2 className="text-gray-900 font-semibold line-clamp-2 text-lg md:text-xl">
              {product.title}
            </h2>
            <div
              className="text-gray-600 text-sm line-clamp-2 md:text-base"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="block w-fit rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm">
                {product.tags?.length ? product.tags[0] : "N/A"}
              </span>

              <span className="block text-primary text-xs md:text-sm font-semibold">
                {product.stock ? "In Stock" : "Out Stock"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {product.basePrice && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-00 font-semibold text-xs md:text-sm">
                    My Clinic Price:
                  </span>
                  <span className="text-gray-950 font-semibold text-sm md:text-lg lg:text-xl min-w-16 text-end">
                    {product.basePrice}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                {useAddToStoreToggle ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-gray-700 font-medium text-xs md:text-sm shrink-0">
                      Add to My Store
                    </span>
                    <Switch
                      checked={isMarkedUp}
                      onChange={(checked) => {
                        if (checked) {
                          if (
                            onAddToStoreWithPrice &&
                            displayPriceValue != null &&
                            displayPriceValue > 0
                          ) {
                            onAddToStoreWithPrice(productId, displayPriceValue);
                          } else {
                            onBtnClick?.(product.id);
                          }
                        } else {
                          onRemoveFromSale?.(productId);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="group inline-flex cursor-pointer h-6 w-11 shrink-0 items-center rounded-full bg-gray-200 transition data-[checked]:bg-gradient-to-r data-[checked]:from-[#3C85F5] data-[checked]:to-[#1A407A]"
                    >
                      <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                    </Switch>
                  </div>
                ) : (
                  <>
                    {isMarkedUp && onRemoveFromSale && (
                      <Tooltip content="Remove from Sale">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromSale(productId);
                          }}
                          className="shrink-0 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        >
                          <CrossIcon width="16" height="16" fill="#6B7280" />
                        </button>
                      </Tooltip>
                    )}
                    {orderButtonDisabled ? (
                      <span className="flex-1 flex">
                        <ThemeButton
                          label={
                            isMarkedUp
                              ? "Change Customer Price"
                              : "Add to My Store"
                          }
                          icon={<InventoryIcon fill="#2862A9" />}
                          variant="outline"
                          className="flex-1 pointer-events-none"
                          heightClass="h-10 md:h-11"
                          disabled
                        />
                      </span>
                    ) : (
                      <ThemeButton
                        label={
                          isMarkedUp
                            ? "Change Customer Price"
                            : "Add to My Store"
                        }
                        icon={<InventoryIcon fill="#2862A9" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBtnClick?.(product.id);
                        }}
                        variant="outline"
                        className="flex-1"
                        heightClass="h-10 md:h-11"
                        disabled={false}
                      />
                    )}
                  </>
                )}

                <h2 className="text-gray-950 font-semibold text-sm md:text-lg lg:text-xl min-w-16 text-end">
                  {product.price}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
