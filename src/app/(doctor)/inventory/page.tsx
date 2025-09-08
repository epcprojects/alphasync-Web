import ProductCard from "@/app/components/ui/cards/ProductCard";
import {
  DeliveryBoxIcon,
  FavoriteIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
  ShopingCartIcon,
} from "@/icons";
import Image from "next/image";
import React from "react";

const products = [
  {
    id: 1,
    title: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
    description: "A 1:1 blend of CJC-1295 No DAC (5mg) and Ipamorelin (5mg)",
    category: "Healing Peptide",
    stock: 45,
    price: "$89.99",
    image: "/images/products/p1.png",
  },
  {
    id: 2,
    title: "BPC-157 (5mg)",
    description: "Promotes recovery and healing of tissues.",
    category: "Regenerative Peptide",
    stock: 60,
    price: "$59.99",
    image: "/images/products/p1.png",
  },
  {
    id: 3,
    title: "TB-500 (5mg)",
    description: "Supports repair and flexibility of tissues.",
    category: "Performance Peptide",
    stock: 30,
    price: "$74.99",
    image: "/images/products/p1.png",
  },
];

const page = () => {
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <DeliveryBoxIcon />
          </span>
          <h2 className="w-full text-black font-semibold text-lg md:text-3xl">
            Peptide Inventory
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-lg w-fit">
          <div className="flex items-center relative">
            <span className="absolute left-2">
              <SearchIcon />
            </span>
            <input
              readOnly
              value={""}
              placeholder="Search"
              className="ps-8 py-2 bg-gray-100 min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <button className="w-8 h-8 md:h-11 md:w-11 bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white cursor-pointer rounded-full bg-gray-100 flex items-center justify-center">
            <FavoriteIcon />
          </button>

          <button className="w-8 h-8 md:h-11 md:w-11 cursor-pointer rounded-full bg-gray-100 flex items-center justify-center">
            <GridViewIcon />
          </button>

          <button className="w-8 h-8 md:h-11 md:w-11 cursor-pointer rounded-full bg-gray-100 flex items-center justify-center">
            <ListViewIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {/* <div className="rounded-2xl pb-2 flex-col bg-white shadow-xl border border-gray-200 px-2 flex items-center justify-center">
          <div className="bg-[url(/images/productBgPattern.png)] !bg-center bg-cover h-60 flex items-center justify-center w-60">
            <Image
              width={280}
              height={280}
              src={"/images/products/p1.png"}
              alt="image"
            />
          </div>

          <div className="bg-gray-50 p-2 md:p-4 w-full rounded-lg">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-gray-900 font-semibold text-sm md:text-lg">
                  2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)
                </h2>
                <h3 className="text-gray-600 text-xs md:text-sm">
                  A 1:1 blend of CJC-1295 No DAC (5mg) and Ipamorelin (5mg)
                </h3>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="block w-fit rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm">
                  Healing Peptide
                </span>

                <span className="block text-primary text-xs md:text-sm font-semibold">
                  Stock: 45
                </span>
              </div>

              <div className="flex items-center justify-between">
                <button className="border flex items-center gap-2  md:min-w-60  justify-center border-gray-300 shadow text-gray-700 md:text-base text-sm font-semibold bg-white rounded-full px-2 md:px-4 py-1.5 md:py-2.5">
                  <ShopingCartIcon /> Order
                </button>

                <h2 className="text-gray-950 font-semibold text-sm md:text-lg">
                  $89.99
                </h2>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default page;
