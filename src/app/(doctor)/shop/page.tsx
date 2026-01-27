"use client";
import { Pagination, ShopProductCard, ThemeButton } from "@/app/components";
import Tooltip from "@/app/components/ui/tooltip";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  DeliveryBoxIcon,
  FavoriteIcon,
  GridViewIcon,
  HeartFilledIcon,
  ListViewIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartRemoveIcon,
} from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [showGridView, setShowGridView] = useState(true);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = 1;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <DeliveryBoxIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              Shop now
            </h2>
            <p className="text-sm sm:text-base">
              These are the items your customers see. They won’t see your clinic
              price.
            </p>
          </div>
        </div>

        <div className="sm:bg-white rounded-full flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
          <div className="flex items-center relative w-full p-1 sm:p-0 rounded-full bg-white sm:bg-transparent shadow-table sm:shadow-none">
            <span className="absolute left-3">
              <SearchIcon
                height={isMobile ? "16" : "20"}
                width={isMobile ? "16" : "20"}
              />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-56 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <div className="sm:py-[2px] sm:px-0 flex items-center gap-1 md:gap-2 rounded-full bg-white sm:bg-transparent p-1 shadow-table sm:shadow-none">
            <Tooltip content="Favorite Products">
              <button
                onClick={() => setShowFavourites((prev) => !prev)}
                className={`w-8 h-8 shrink-0 md:h-11 md:w-11 ${
                  showFavourites &&
                  "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
                }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
              >
                {showFavourites ? (
                  <HeartFilledIcon
                    height={isMobile ? 16 : 20}
                    width={isMobile ? 16 : 20}
                  />
                ) : (
                  <FavoriteIcon
                    height={isMobile ? "16" : "20"}
                    width={isMobile ? "16" : "20"}
                  />
                )}
              </button>
            </Tooltip>

            <Tooltip content="Grid View">
              <button
                onClick={() => {
                  setShowGridView(true);
                }}
                className={`w-8 h-8 md:h-11 shrink-0 md:w-11 ${
                  showGridView &&
                  "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
                }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
              >
                <GridViewIcon
                  height={isMobile ? "15" : "20"}
                  width={isMobile ? "15" : "20"}
                />
              </button>
            </Tooltip>

            <Tooltip content="List View">
              <button
                onClick={() => {
                  setShowGridView(false);
                }}
                className={`w-8 h-8 md:h-11 shrink-0 md:w-11 ${
                  !showGridView &&
                  "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
                }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
              >
                <ListViewIcon
                  height={isMobile ? "15" : "20"}
                  width={isMobile ? "15" : "20"}
                />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
        <ShopProductCard
          key={1}
          product={{
            category: "Healing Peptide",
            description:
              "A 1:1 blend of CJC-1295 No DAC (5mg) and Ipamorelin (5mg)",
            id: 1,
            image:
              "https://cdn.shopify.com/s/files/1/0904/1811/8965/files/ABM-SC-DIHEX-10x30_03345989-23ee-4fa3-9b74-ada8af232649.webp?v=1759262951",
            isFavourite: false,
            price: "$83.00",
            stock: 50,
            title: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
            basePrice: "$83.00",
          }}
          onBtnClick={() => {}}
          onCardClick={() => {}}
        />
        <ShopProductCard
          key={2}
          product={{
            category: "Healing Peptide",
            description:
              "A 1:1 blend of CJC-1295 No DAC (5mg) and Ipamorelin (5mg) nd Ipamorelin (5mg)",
            id: 1,
            image:
              "https://cdn.shopify.com/s/files/1/0904/1811/8965/files/ABM-SC-DIHEX-10x30_03345989-23ee-4fa3-9b74-ada8af232649.webp?v=1759262951",
            isFavourite: false,
            price: "$83.00",
            stock: 50,
            title: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
            basePrice: "$83.00",
          }}
          onBtnClick={() => {}}
          onCardClick={() => {}}
        />
      </div>

      <Pagination
        currentPage={currentPage - 1} // Convert 1-based to 0-based for pagination component
        totalPages={pageCount + 2}
        onPageChange={(selectedPage) => handlePageChange(selectedPage + 1)} // Convert 0-based back to 1-based
      />

      <div className="h-full bg-white py-20 flex flex-col justify-center items-center gap-7 text-center rounded-xl">
        <ShoppingCartRemoveIcon />
        <div className="space-y-3">
          <h2 className="font-semibold text-2xl text-gray-900">
            Your shop is empty.
          </h2>

          <p className="font-medium text-lg text-gray-800">
            Head to{" "}
            <Link
              className="text-primary hover:underline underline-offset-2"
              href="/inventory"
            >
              Inventory
            </Link>
            , mark up an item, and start selling.
          </p>
        </div>
        <ThemeButton
          label="Add Products"
          icon={<PlusIcon />}
          onClick={() => router.push("/inventory")}
        />
      </div>
    </div>
  );
};

export default Page;
