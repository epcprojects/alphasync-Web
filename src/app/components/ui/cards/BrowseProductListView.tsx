"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { InfoIcon, ShopingCartIcon } from "@/icons";
import Image from "next/image";

type Product = {
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

type BrowseProductListViewProps = {
  product: Product;
  onInfoBtn: (product: Product) => void;
  onAddToCart?: (id: number) => void;
  onRowClick?: () => void;
};

export default function BrowseProductListView({
  product: product,
  onInfoBtn,
  onAddToCart,
  onRowClick,
}: BrowseProductListViewProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="bg-white flex flex-col gap-5 p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] rounded-xl">
        <div className="flex flex-col gap-3">
          <div className=" flex items-center gap-3">
            <div className="h-10 w-10 md:w-14 md:h-14 shrink-0 bg-gray-100 rounded-md md:rounded-lg flex items-center justify-center">
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
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-normal">
              {product.productForm}
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full  border  px-2.5 py-0.5 text-xs md:text-sm font-medium  ${
                  product.prescription
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-green-50 border-green-200 text-green-700"
                }`}
              >
                {product.prescription ? "Rx Required" : "Not Required"}
              </span>
              <span
                className={`border rounded-full py-0.5 px-2.5 text-xs font-medium block whitespace-nowrap w-fit ${
                  product.stock
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {product.stock ? "In Stock" : "Out Stock"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-black text-sm font-normal">Price:</span>
            <span className="text-primary text-sm font-semibold">
              {product.price}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onInfoBtn(product)}
              className="flex h-7 w-7 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-md border cursor-pointer border-lightGray"
            >
              <InfoIcon fill="#9CA3AF" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product.id);
              }}
              className="flex h-7 px-2 text-xs gap-1 md:h-8 shrink-0 items-center justify-center rounded-md border cursor-pointer border-lightGray"
            >
              <ShopingCartIcon width={16} height={16} />
              Request from Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onRowClick}
      key={product.id}
      className="grid cursor-pointer grid-cols-2  md:grid-cols-12  md:gap-4 items-center rounded-xl bg-white p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]"
    >
      <div className="lg:col-span-3 col-span-4 flex items-center gap-3">
        <div className="h-10 w-10 md:w-14 md:h-14 shrink-0 bg-gray-100 rounded-md md:rounded-lg flex items-center justify-center">
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
      <div className="lg:col-span-2 col-span-3">
        <span className="inline-block rounded-full whitespace-nowrap bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-xs md:text-sm font-medium text-gray-700">
          {product.category}
        </span>
      </div>

      <div className="col-span-2 lg:block hidden items-start md:items-center md:justify-start justify-end">
        <span className="text-gray-800  text-xs md:text-sm font-normal">
          {product.productForm}
        </span>
      </div>

      <div className="col-span-2 font-medium text-xs whitespace-nowrap md:text-sm text-gray-800">
        <span
          className={`inline-block rounded-full  border  px-2.5 py-0.5 text-xs md:text-sm font-medium  ${
            product.prescription
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          {product.prescription ? "Rx Required" : "Not Required"}
        </span>
      </div>

      <div className="col-span-1 xl:block hidden font-medium text-xs md:text-sm text-gray-800">
        <span
          className={`border rounded-full py-0.5 px-2.5 block whitespace-nowrap w-fit ${
            product.stock
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {product.stock ? "In Stock" : "Out Stock"}
        </span>
      </div>

      <div className="col-span-1 font-medium text-xs md:text-sm text-primary">
        <span className="font-medium text-xs pe-1 text-black inline-flex md:hidden">
          Price:
        </span>
        {product.price}
      </div>

      <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-center justify-end md:justify-center gap-2">
        <button
          onClick={() => onInfoBtn(product)}
          className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-md border cursor-pointer border-lightGray"
        >
          <InfoIcon fill="#9CA3AF" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(product.id);
          }}
          className="flex h-6 w-6 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-md border cursor-pointer border-lightGray"
        >
          <ShopingCartIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
}
