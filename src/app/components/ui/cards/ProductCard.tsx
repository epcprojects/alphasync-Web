"use client";

import { HeartFilledIcon, HeartOutlineIcon, ShopingCartIcon } from "@/icons"; // adjust import based on your project
import ThemeButton from "../buttons/ThemeButton";
import ProductImage from "@/app/components/ui/ProductImage";

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  stock: boolean;
  price: string;
  image: string;
  isFavourite: boolean;
  tags?: string[];
};

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: number) => void;
  onCardClick?: () => void;
  onToggleFavourite?: (id: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onCardClick,
  onToggleFavourite,
}: ProductCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="rounded-2xl pb-2 cursor-pointer flex-col bg-white shadow-table border relative border-gray-200 px-2 flex items-center justify-center"
    >
      <button
        className="absolute top-4 end-4 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavourite?.(product.id);
        }}
      >
        {product.isFavourite ? (
          <HeartFilledIcon fill="#2862A9" />
        ) : (
          <HeartOutlineIcon fill="#374151" />
        )}
      </button>
      <div className="bg-[url(/images/productBgPattern.png)] bg-cover h-52 md:h-60 pt-3 pb-2 bg-[position:0_20px] flex items-center justify-center ">
        <ProductImage
          width={240}
          height={240}
          src={product.image}
          alt={product.title}
        />
      </div>

      <div className="bg-gray-50 border border-gray-100 p-2 md:p-4 md:min-h-56 md:max-h-56 w-full rounded-lg">
        <div className="flex flex-col gap-2 h-full justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-900 font-semibold line-clamp-2 text-base md:text-lg">
              {product.title}
            </h2>
            <div
              className="text-gray-600 text-xs line-clamp-2 md:text-sm"
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

            <div className="flex items-center justify-between gap-4">
              <ThemeButton
                label="Order"
                icon={<ShopingCartIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product.id);
                }}
                variant="outline"
                className="flex-1"
                heightClass="h-10 md:h-11"
              />

              <h2 className="text-gray-950 font-semibold text-sm md:text-lg lg:text-xl min-w-16 text-end">
                {product.price}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
