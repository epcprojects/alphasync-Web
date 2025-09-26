"use client";

import {
  ArrowLeftIcon,
  FilterIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
  ShopingCartFilledicon,
} from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { products } from "../../../../public/data/products";
import { useIsMobile } from "@/hooks/useIsMobile";
import BrowserProductCard, {
  Product,
} from "@/app/components/ui/cards/BrowserProductCard";
import RequestModel from "@/app/components/ui/modals/RequestModel";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import BrowseProductListView from "@/app/components/ui/cards/BrowseProductListView";
import ProductDetails from "@/app/components/ui/modals/ProductDetails";

const orderCategories = [
  { label: "All Categories" },
  { label: "Regenerative Peptide" },
  { label: "Healing Peptide" },
  { label: "Performance Peptide" },
  { label: "Cosmetic" },
  { label: "Sexual Health" },
  { label: "Anti-Aging" },
];

function InventoryContent() {
  const [search, setSearch] = useState("");
  const [showGridView, setShowGridView] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const itemsPerPage = 9;
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    orderCategories[0].label
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProducts.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <ShopingCartFilledicon />
          </span>
          <h2 className="lg:w-full text-black font-semibold text-lg md:text-2xl lg:3xl">
            Browse Products
          </h2>
          <div className="px-2.5 py-0.5 rounded-full bg-white border border-indigo-200">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              {currentItems.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-full w-full flex items-center gap-1 md:gap-2 p-1.5 md:p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] lg:w-fit">
          <div className="flex items-center relative w-full">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <Menu>
            <MenuButton className="h-8 w-8 md:h-11 md:w-11 shrink-0 flex justify-center cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full  text-sm/6 font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
              <FilterIcon />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none gap-1 flex flex-col data-closed:scale-95 data-closed:opacity-0`}
            >
              {orderCategories.map((cat) => (
                <MenuItem key={cat.label}>
                  <button
                    onClick={() => {
                      setCurrentPage(0);
                      setSelectedCategory(cat.label);
                    }}
                    className={`${
                      selectedCategory === cat.label
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-500 bg-white"
                    } flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5  hover:bg-gray-100 w-full`}
                  >
                    {cat.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

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
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-6">
        {showGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
            {currentItems.map((product) => (
              <BrowserProductCard
                key={product.id}
                product={product}
                onAddToCart={() => setIsOrderModalOpen(true)}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium bg-white rounded-xl text-black shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
              <div className="lg:col-span-3 sm:col-span-4">Product</div>
              <div className="lg:col-span-2 sm:col-span-3">Category</div>
              <div className="col-span-2">Form</div>
              <div className="col-span-2 lg:block hidden">Prescription</div>
              <div className="xl:block hidden col-span-1">Stock</div>
              <div className="col-span-1">Price</div>

              <div className="col-span-1 md:col-span-2 lg:col-span-1 text-center">
                Actions
              </div>
            </div>
            {currentItems.map((product) => (
              <BrowseProductListView
                onRowClick={() => {}}
                key={product.id}
                product={product}
                onInfoBtn={handleCardClick}
                onAddToCart={() => setIsOrderModalOpen(true)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center ">
          {currentItems.length > 0 && (
            <div className="w-full flex items-center justify-center">
              <ReactPaginate
                breakLabel="..."
                nextLabel={
                  <span className="flex items-center justify-center h-9 md:w-full md:h-full w-9 select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                    <span className="hidden md:inline-block">Next</span>
                    <span className="block mb-0.5 rotate-180">
                      <ArrowLeftIcon />
                    </span>
                  </span>
                }
                previousLabel={
                  <span className="flex items-center  h-9 md:w-full md:h-full w-9 justify-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                    <span className="md:mb-0.5">
                      <ArrowLeftIcon />
                    </span>
                    <span className="hidden md:inline-block">Previous</span>
                  </span>
                }
                onPageChange={handlePageChange}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                pageCount={pageCount}
                forcePage={currentPage}
                pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer  hidden md:block"
                containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white"
                pageClassName=" rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
                activeClassName="bg-gray-200 text-gray-900 font-medium"
                previousClassName="md:px-4 md:py-2 rounded-full  absolute left-3 md:left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                nextClassName="md:px-4 md:py-2 rounded-full bg-gray-50  absolute end-3 md:end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
                breakClassName="px-3 py-1 font-semibold text-gray-400"
              />

              <h2 className="absolute md:hidden text-gravel font-medium text-sm">
                Page {currentPage + 1} of {pageCount}
              </h2>
            </div>
          )}
        </div>
      </div>

      <RequestModel
        isOpen={isOrderModalOpen}
        onConfirm={(reason) => {
          handleConfirmOrder();
          console.log(reason);
        }}
        onClose={() => setIsOrderModalOpen(false)}
      />
      {isProductModalOpen && selectedProduct && (
        <ProductDetails
          isOpen={isProductModalOpen}
          product={selectedProduct}
          onClose={() => setIsProductModalOpen(false)}
          onClick={() => {
            setIsProductModalOpen(false);
            setIsOrderModalOpen(true);
          }}
        />
      )}
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
