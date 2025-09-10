"use client";
import { HeartFilledIcon, HeartOutlineIcon, ShopingCartIcon } from "@/icons";
import Image from "next/image";

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  stock: number;
  price: string;
  image: string;
  isFavourite: boolean;
};

type ProductListViewProps = {
  product: Product;
  onToggleFavourite?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  onRowClick?: () => void;
};

export default function ProductListView({
  product: product,
  onToggleFavourite,
  onAddToCart,
  onRowClick,
}: ProductListViewProps) {
  return (
    <div
      onClick={onRowClick}
      key={product.id}
      className="grid cursor-pointer grid-cols-12 gap-4 items-center rounded-xl bg-white p-1 md:p-2"
    >
      <div className="col-span-5 flex items-center gap-3">
        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
          <Image
            width={36}
            height={36}
            src={product.image}
            alt={product.title}
          />
        </div>
        <div>
          <h3 className="font-semibold line-clamp-1 text-gray-800 text-sm md:text-base">
            {product.title}
          </h3>
          <p className="text-gray-800 text-[10px] font-normal md:text-xs line-clamp-1">
            {product.description}
          </p>
        </div>
      </div>
      <div className="col-span-3">
        <span className="inline-block rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs md:text-sm font-medium text-gray-700">
          {product.category}
        </span>
      </div>

      <div className="col-span-2">
        <button className="text-primary hover:underline text-xs md:text-sm font-medium">
          {product.stock} units
        </button>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        {product.price}
      </div>

      <div className="col-span-1 flex items-center justify-center gap-2">
        <button
          onClick={() => onToggleFavourite?.(product.id)}
          className={`flex h-8 w-8 items-center justify-center rounded-md border cursor-pointer border-red-500 ${
            product.isFavourite ? "bg-red-50 text-red-500" : "text-red-500"
          }`}
        >
          {product.isFavourite ? (
            <HeartFilledIcon fill="red" width={16} height={16} />
          ) : (
            <HeartOutlineIcon fill="red" width={16} height={16} />
          )}
        </button>

        <button
          onClick={() => onAddToCart?.(product.id)}
          className="flex h-8 w-8 items-center justify-center rounded-md border cursor-pointer border-primary"
        >
          <ShopingCartIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
