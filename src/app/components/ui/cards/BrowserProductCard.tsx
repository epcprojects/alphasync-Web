"use client";

import Image from "next/image";
import { InfoIcon, ShopingCartIcon } from "@/icons";
import ThemeButton from "../buttons/ThemeButton";
import Tooltip from "../tooltip";

export type Product = {
  id: number;
  title: string;
  description: string;
  prescription: boolean;
  category: string;
  productForm: string;
  stock: number;
  price: string;
  image: string;
  isFavourite: boolean;
};

interface BrowserProductCardProps {
  product: Product;
  onAddToCart?: (id: number) => void;
  onCardClick: (product: Product) => void;
}

export default function BrowserProductCard({
  product,
  onAddToCart,
  onCardClick,
}: BrowserProductCardProps) {
  return (
    <div className="rounded-2xl pb-2  flex-col bg-white shadow-table border relative border-gray-200 px-2 flex items-center justify-center">
      <div className="absolute top-4  end-4">
        <Tooltip className="" content="View Detail">
          <button
            className="pb-1 cursor-pointer rotate-180"
            onClick={() => onCardClick(product)}
          >
            <InfoIcon fill="#374151" width={28} height={28} />
          </button>
        </Tooltip>
      </div>
      <div className="bg-[url(/images/productBgPattern.png)] bg-[position:0_20px] bg-cover h-52 md:h-60 pt-3 pb-2 flex items-center justify-center ">
        <Image
          width={280}
          className="h-full object-contain"
          height={280}
          src={product.image}
          alt={product.title}
        />
      </div>

      <div className="bg-gray-50 border border-gray-100 p-2 md:p-4 md:min-h-56 md:max-h-56 w-full rounded-lg">
        <div className="flex flex-col gap-2 h-full justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <h2 className="text-gray-800 font-semibold line-clamp-1 overflow-hidden text-base md:text-lg">
                {product.title}
              </h2>
              <span className="block w-fit whitespace-nowrap rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm">
                {product.category}
              </span>
            </div>
            <h3 className="text-gray-600 text-xs line-clamp-2 md:text-sm">
              {product.description}
            </h3>
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-600 text-xs md:text-sm font-normal">
                {product.productForm}
              </span>

              <div className="flex items-center gap-2">
                {product.prescription && (
                  <span
                    className={`inline-block rounded-full  border  px-2.5 py-0.5 text-xs md:text-sm font-mediumbg-amber-50 border-amber-200 text-amber-700`}
                  >
                    Rx Required
                  </span>
                )}
                <span className="block text-blue-700 border-blue-200 border bg-blue-50 text-xs md:text-sm py-0.5 px-2.5 rounded-full">
                  {product.stock ? "In Stock" : "Out Stock"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <ThemeButton
                label="Request from Doctor"
                icon={<ShopingCartIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product.id);
                }}
                variant="outline"
                className="w-full"
                heightClass="h-10 md:h-11"
              />

              <h2 className="text-primary font-semibold text-sm md:text-lg min-w-16 text-end">
                {product.price}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
