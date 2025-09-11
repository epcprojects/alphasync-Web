"use client";

import OrderModal from "@/app/components/ui/modals/OrderModal";
import { ProductCard, ProductListView } from "@/components";
import {
  ArrowLeftIcon,
  DeliveryBoxIcon,
  FavoriteIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
} from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { products } from "../../../../public/data/products";

function InventoryContent() {
  const [search, setSearch] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [showGridView, setShowGridView] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 9;

  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesFavourite = showFavourites ? p.isFavourite : true;

    return matchesSearch && matchesFavourite;
  });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProducts.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showFavourites]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected));
    router.replace(`?${params.toString()}`);
  };

  const handleConfirmOrder = () => {
    setIsOrderModalOpen(false);
    showSuccessToast("Order created successfully!");
  };
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 py-2 bg-gray-100 min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <button
            onClick={() => setShowFavourites((prev) => !prev)}
            className={`w-8 h-8 md:h-11 md:w-11 ${
              showFavourites &&
              "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
            }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
          >
            <FavoriteIcon />
          </button>

          <button
            onClick={() => {
              setShowGridView(true);
            }}
            className={`w-8 h-8 md:h-11 md:w-11 ${
              showGridView &&
              "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
            }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
          >
            <GridViewIcon />
          </button>

          <button
            onClick={() => {
              setShowGridView(false);
            }}
            className={`w-8 h-8 md:h-11 md:w-11 ${
              !showGridView &&
              "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
            }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
          >
            <ListViewIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-4">
        {showGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
            {currentItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => setIsOrderModalOpen(true)}
                onCardClick={() => router.push(`/inventory/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium bg-white rounded-xl text-black">
              <div className="col-span-5">Product</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
            {currentItems.map((product) => (
              <ProductListView
                onRowClick={() => router.push(`/inventory/${product.id}`)}
                key={product.id}
                product={product}
                onToggleFavourite={(id) => console.log("Fav toggled", id)}
                onAddToCart={() => setIsOrderModalOpen(true)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center ">
          {currentItems.length > 0 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel={
                <span className="flex items-center select-none font-semibold text-xs md:text-sm text-gray-600 gap-1">
                  Next
                  <span className="block mb-0.5 rotate-180">
                    <ArrowLeftIcon />
                  </span>
                </span>
              }
              previousLabel={
                <span className="flex items-center select-none font-semibold text-xs md:text-sm text-gray-600 gap-1">
                  <span className="mb-0.5">
                    <ArrowLeftIcon />
                  </span>{" "}
                  Previous
                </span>
              }
              onPageChange={handlePageChange}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pageCount}
              forcePage={currentPage}
              pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer block"
              containerClassName="flex items-center relative w-full justify-center gap-2 px-4 py-3 rounded-2xl bg-white"
              pageClassName=" rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
              activeClassName="bg-gray-200 text-gray-900 font-medium"
              previousClassName="px-4 py-2 rounded-full  absolute left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
              nextClassName="px-4 py-2 rounded-full bg-gray-50  absolute end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
              breakClassName="px-3 py-1 font-semibold text-gray-400"
            />
          )}
        </div>
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onConfirm={() => handleConfirmOrder()}
        customers={[
          {
            name: "John Smith",
            displayName: "John Smith",
            email: "john.smith@email.com john.smith@email.com",
          },
          {
            name: "Sarah J",
            displayName: "Sarah J",
            email: "john.smith@email.com",
          },
          {
            name: "Emily Chen",
            displayName: "Emily Chen",
            email: "john.smith@email.com",
          },
        ]}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
