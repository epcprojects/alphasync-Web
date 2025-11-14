"use client";
import { HeartFilledIcon, HeartOutlineIcon, ShopingCartIcon } from "@/icons";
import Image from "next/image";
import Tooltip from "../tooltip";
import ProductImage from "@/app/components/ui/ProductImage";

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  stock: number;
  price: string;
  image: string;
  isFavourite: boolean;
  tags?: string[];
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
      className="grid cursor-pointer grid-cols-2 hover:bg-gray-100 group md:grid-cols-12 gap-2 md:gap-4 items-center rounded-xl bg-white p-3 shadow-table"
    >
      <div className="col-span-2 md:col-span-4 lg:col-span-5 flex items-center gap-3">
        <div className="h-10 w-10 md:w-14 md:h-14 shrink-0 group-hover:bg-white bg-gray-100 rounded-md md:rounded-lg flex items-center justify-center">
          <ProductImage
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
          <p
            className="text-gray-800 text-[10px] font-normal md:text-xs line-clamp-1"
            dangerouslySetInnerHTML={{
              __html: product.description || "No description available",
            }}
          ></p>
        </div>
      </div>

      <div className="col-span-1 md:col-span-3">
        {product.tags?.length && (
          <span className="inline-block rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs md:text-sm font-medium text-gray-700">
            {product.tags[0]}
          </span>
        )}
      </div>

      <div className="col-span-1 md:col-span-2 md:block flex items-start md:items-center md:justify-start justify-end">
        <span className="font-medium text-xs inline-flex pe-1 md:hidden text-primary">
          Stock:
        </span>
        <span className="text-primary text-xs md:text-sm font-normal md:font-medium">
          {product.stock} units
        </span>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-800">
        <span className="font-medium text-xs pe-1 text-black inline-flex md:hidden">
          Price:
        </span>
        {product.price}
      </div>

      <div className="col-span-1 flex items-center justify-end md:justify-center gap-2">
        <Tooltip
          content={product.isFavourite ? "Remove Favourite" : "Mark Favourite"}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite?.(product.id);
            }}
            className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            {product.isFavourite ? (
              <HeartFilledIcon fill="#2862A9" width={16} height={16} />
            ) : (
              <HeartOutlineIcon fill="#2862A9" width={16} height={16} />
            )}
          </button>
        </Tooltip>

        <Tooltip content="Order Now">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product.id);
            }}
            className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <ShopingCartIcon width={16} height={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
