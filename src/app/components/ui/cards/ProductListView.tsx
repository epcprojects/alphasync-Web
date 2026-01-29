"use client";
import { HeartFilledIcon, HeartOutlineIcon, RejectIcon, InventoryIcon } from "@/icons";
import Tooltip from "../tooltip";
import ProductImage from "@/app/components/ui/ProductImage";

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

type ProductListViewProps = {
  product: Product;
  onToggleFavourite?: (id: number) => void;
  onBtnClick?: (id: number) => void;
  onRowClick?: () => void;
  onRemoveFromSale?: (productId: string) => void;
  customPrice?: number | null;
};

export default function ProductListView({
  product: product,
  onToggleFavourite,
  onBtnClick,
  onRowClick,
  onRemoveFromSale,
  customPrice,
}: ProductListViewProps) {
  const productId = product.originalId || String(product.id);
  const isMarkedUp = customPrice != null && customPrice !== undefined;
  return (
    <div
      onClick={onRowClick}
      key={product.id}
      className="grid cursor-pointer grid-cols-2 hover:bg-gray-100 group md:grid-cols-12 gap-2 md:gap-4 items-center rounded-xl bg-white p-3 shadow-table"
    >
      <div className="col-span-2 md:col-span-4 lg:col-span-4 flex items-start sm:items-center gap-3">
        <div className="h-10 w-10 md:w-14 md:h-14 shrink-0 group-hover:bg-white bg-gray-100 rounded-md md:rounded-lg flex items-center justify-center">
          <ProductImage
            width={36}
            height={36}
            src={product.image}
            alt={product.title}
            className="w-full h-full border rounded-lg border-gray-200"
          />
        </div>
        <div>
          <h3 className="font-semibold sm:line-clamp-1 text-gray-800 text-sm md:text-base">
            {product.title}
          </h3>
          <p
            className="text-gray-800 text-xs font-normal md:text-sm line-clamp-3 sm:line-clamp-1"
            dangerouslySetInnerHTML={{
              __html: product.description || "No description available",
            }}
          ></p>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2">
        {product.tags?.length && (
          <span className="inline-block rounded-full bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs md:text-sm font-medium text-gray-700">
            {product.tags[0]}
          </span>
        )}
      </div>

      <div className="col-span-1 md:col-span-1 md:block flex items-center md:justify-start justify-end">
        <span className="font-medium text-xs inline-flex pe-1 md:hidden text-primary">
          Stock:
        </span>
        <span
          className={`text-xs md:text-sm font-normal md:font-medium rounded-full py-0.5 px-2.5 border ${
            product.stock
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {product.stock ? "In Stock" : "Out Stock"}
        </span>
      </div>

      <div className="col-span-2 font-medium text-xs md:text-sm text-gray-800">
        <span className="font-medium text-xs pe-1 text-black inline-flex md:hidden">
          Latest Marked up Price:
        </span>
        {product.price}
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-gray-600">
        <span className="font-medium text-xs pe-1 text-black inline-flex md:hidden">
          Base Price:
        </span>
        {product.basePrice || "-"}
      </div>

      <div className="col-span-1 md:col-span-2 lg:col-span-2 flex items-center justify-end md:justify-center gap-2">
        <Tooltip
          content={product.isFavourite ? "Remove Favorite" : "Mark Favorite"}
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

        {isMarkedUp && onRemoveFromSale && (
          <Tooltip content="Remove from Sale">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromSale?.(productId);
              }}
              className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-md border cursor-pointer border-gray-300 text-gray-600 hover:bg-gray-50 [&_svg]:w-4 [&_svg]:h-4 md:[&_svg]:w-5 md:[&_svg]:h-5"
            >
              <RejectIcon />
            </button>
          </Tooltip>
        )}

        <Tooltip content={isMarkedUp ? "Change Customer Price" : "Add to Shop"}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBtnClick?.(product.id);
            }}
            disabled={!onBtnClick}
            className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-md border cursor-pointer border-primary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isMarkedUp ? "Change Customer Price" : "Add to Shop"}
            type="button"
          >
            <InventoryIcon fill="#2862A9" width={16} height={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
