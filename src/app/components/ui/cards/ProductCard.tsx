"use client";

import Image from "next/image";
import { ShopingCartIcon } from "@/icons"; // adjust import based on your project

type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  stock: number;
  price: string;
  image: string;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-2xl pb-2 flex-col bg-white shadow-xl border border-gray-200 px-2 flex items-center justify-center">
      <div className="bg-[url(/images/productBgPattern.png)] !bg-center bg-cover h-60 flex items-center justify-center w-60">
        <Image
          width={280}
          height={280}
          src={product.image}
          alt={product.title}
        />
      </div>

      <div className="bg-gray-50 p-2 md:p-4 w-full rounded-lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-900 font-semibold text-sm md:text-lg">
              {product.title}
            </h2>
            <h3 className="text-gray-600 text-xs md:text-sm">
              {product.description}
            </h3>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="block w-fit rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm">
              {product.category}
            </span>

            <span className="block text-primary text-xs md:text-sm font-semibold">
              Stock: {product.stock}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button className="border flex items-center gap-2 md:min-w-60 justify-center border-gray-300 shadow text-gray-700 md:text-base text-sm font-semibold bg-white rounded-full px-2 md:px-4 py-1.5 md:py-2.5">
              <ShopingCartIcon /> Order
            </button>

            <h2 className="text-gray-950 font-semibold text-sm md:text-lg">
              {product.price}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
