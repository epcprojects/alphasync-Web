"use client";

import { CrossIcon, InventoryIcon, ShopingCartIcon } from "@/icons";
import ThemeButton from "../buttons/ThemeButton";
import ProductImage from "@/app/components/ui/ProductImage";

type Product = {
  id: number;
  originalId?: string;
  title: string;
  description: string;
  category: string;
  stock: number;
  price: string;
  image: string;
  isFavourite: boolean;
  basePrice?: string;
};

interface ProductCardProps {
  product: Product;
  onBtnClick?: (id: number) => void;
  onCardClick?: () => void;
}

export default function ShopProductCard({
  product,
  onBtnClick,
  onCardClick,
}: ProductCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="rounded-2xl pb-2 relative cursor-pointer flex-col bg-white shadow-table border  border-gray-200 px-2 flex items-center justify-center"
    >
      <button
        className="absolute top-4 end-4 text-gray-700 hover:bg-gray-100 rounded-full border border-gray-200 h-8 w-8 md:h-11 md:w-11 flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <CrossIcon fill="currentColor" />
      </button>
      <div className="bg-[url(/images/productBgPattern.png)] bg-cover h-52 md:h-60 pt-3 pb-2 bg-[position:0_20px] flex items-center justify-center ">
        <ProductImage
          width={240}
          height={240}
          src={product.image}
          alt={product.title}
        />
      </div>

      <div className="bg-gray-50 border border-gray-100 p-2 md:p-4 md:min-h-64  w-full rounded-lg">
        <div className="flex flex-col gap-2 h-full justify-between">
          <div className="flex flex-col gap-1">
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
                {product.category}
              </span>

              <span className="block text-primary text-xs md:text-sm font-semibold">
                {product.stock && product.stock > 0
                  ? `Stock: ${product.stock}`
                  : "Out Stock"}
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
              <div className="flex items-end  gap-2">
                <div className="flex flex-col max-w-20 w-full">
                  <label className="text-sm mb-1 focus:ring focus:ring-gray-300 outline-none text-gray-700 font-medium">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    maxLength={2}
                    value={1}
                    onChange={() => {}}
                    type="number"
                    inputMode="numeric"
                    className="rounded-full h-10 md:h-11 border focus:ring-gray-200 focus:ring-1 outline-none border-gray-200  w-full [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none px-4 text-center"
                  />
                </div>
                <div className="flex items-center w-full gap-2">
                  <ThemeButton
                    label={"Add to Cart"}
                    icon={<ShopingCartIcon height={20} width={20} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBtnClick?.(product.id);
                    }}
                    variant="outline"
                    className="flex-1"
                    heightClass="h-10 md:h-11"
                    disabled={false}
                  />

                  <h2 className="text-gray-950 font-semibold text-sm md:text-lg lg:text-xl min-w-16 text-end">
                    {product.price}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
