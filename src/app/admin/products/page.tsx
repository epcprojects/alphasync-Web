"use client";

import {
  PackageIcon,
  SearchIcon,
  ReloadIcon,
  PackageOutlineIcon,
  ArrowDownIcon,
} from "@/icons";
import React, { Suspense, useState } from "react";
import {
  EmptyState,
  Loader,
  Skeleton,
  ThemeButton,
  Pagination,
} from "@/app/components";
import { useQuery, useMutation } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import Tooltip from "@/app/components/ui/tooltip";
import { SYNC_PRODUCTS } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import {
  AllProductsResponse,
  Product,
  transformGraphQLProduct,
} from "@/types/products";
import ProductImage from "@/app/components/ui/ProductImage";

// Interface for SyncProducts response
interface SyncProductsResponse {
  syncProducts: {
    message: string;
    productsCount: number;
    clientMutationId: string | null;
  };
}

function ProductsContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const isMobile = useIsMobile();
  const itemsPerPage = 10;

  // Debounce search input to avoid too many API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to first page when out of stock filter changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [showOutOfStock]);

  // Reset to first page when category filter changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory]);

  // GraphQL query to fetch products
  const { data, loading, error, refetch } = useQuery<AllProductsResponse>(
    ALL_PRODUCTS_INVENTORY,
    {
      variables: {
        search: debouncedSearch || undefined,
        page: currentPage + 1, // GraphQL uses 1-based pagination
        perPage: itemsPerPage,
        inStockOnly: showOutOfStock ? false : undefined,
        category: selectedCategory || undefined,
      },
      fetchPolicy: "network-only",
    }
  );

  // GraphQL mutation for syncing products
  const [syncProducts] = useMutation<SyncProductsResponse>(SYNC_PRODUCTS);

  // Transform GraphQL product data
  const products: Product[] =
    data?.allProducts.allData?.map(transformGraphQLProduct) || [];

  const pageCount = data?.allProducts.totalPages || 1;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    try {
      const result = await syncProducts({
        variables: {
          clientMutationId: null,
        },
      });

      if (result.data?.syncProducts) {
        const { message, productsCount } = result.data.syncProducts;
        showSuccessToast(
          `${message}. ${productsCount} products synced successfully.`
        );
        // Refetch products after sync
        refetch();
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      showErrorToast("Failed to sync products. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <PackageIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="w-full text-black font-semibold text-lg md:text-2xl lg:3xl">
            Products
          </h2>
        </div>

        <div className="sm:bg-white rounded-full w-full gap-2 flex flex-col sm:flex-row items-center gap-1 md:gap-2 sm:p-1.5 md:px-2.5 md:py-2 sm:shadow-table lg:w-fit">
          <div className="flex items-center relative bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full  shadow-table sm:shadow-none">
            <span className="absolute left-3">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 w-full sm:w-80 sm:min-w-80 focus:bg-white outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
              className="px-3 md:px-4 py-2 bg-gray-100 focus:bg-white outline-none focus:ring focus:ring-gray-200 rounded-full text-sm cursor-pointer appearance-none pr-8 min-w-[140px]"
            >
              <option value="">All Categories</option>
              <option value="Blood">Blood</option>
              <option value="Immunity">Immunity</option>
              <option value="Recovery">Recovery</option>
              <option value="Vial">Vial</option>
            </select>
            <div className="absolute -translate-y-1/2 right-2 top-1/2 pointer-events-none">
              <ArrowDownIcon fill="#717680" />
            </div>
          </div>

          <Tooltip content="Out of Stock">
            <button
              onClick={() => setShowOutOfStock((prev) => !prev)}
              className={`w-8 h-8 md:h-11 shrink-0 md:w-11 ${
                showOutOfStock &&
                "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
              }  cursor-pointer rounded-full bg-gray-100 flex items-center justify-center`}
            >
              <PackageOutlineIcon
                height={isMobile ? "15" : "20"}
                width={isMobile ? "15" : "20"}
              />
            </button>
          </Tooltip>

          <ThemeButton
            label={isSyncing ? "Syncing..." : "Sync Products"}
            icon={<ReloadIcon />}
            onClick={handleSyncProducts}
            disabled={isSyncing}
            className="w-full sm:w-fit"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="hidden sm:grid grid-cols-12 text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
          <div className="col-span-3">
            <h2>Product</h2>
          </div>
          <div className="col-span-2">
            <h2>Category</h2>
          </div>
          <div className="col-span-2">
            <h2>Form</h2>
          </div>
          <div className="col-span-2">
            <h2>Prescription</h2>
          </div>
          <div className="col-span-2">
            <h2>Price</h2>
          </div>
          <div className="col-span-1">
            <h2>Stock</h2>
          </div>
        </div>

        {error && (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error.message}</p>
          </div>
        )}

        {loading ? (
          <div className="my-3 space-y-1">
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="w-full h-12 rounded-full" />
          </div>
        ) : (
          <>
            {products.map((product) => (
              <div
                key={product.originalId}
                className="flex flex-col md:grid md:grid-cols-12 gap-2 mb-4 sm:mb-auto md:gap-4 px-3 py-4 bg-white rounded-xl shadow-table hover:shadow-lg transition-shadow"
              >
                {/* Product */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <ProductImage
                    width={60}
                    height={60}
                    src={product.image}
                    alt={product.title}
                    className="h-[60px] w-[60px] object-contain border rounded-lg border-gray-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm md:text-base text-black ">
                      {product.title}
                    </h3>
                  </div>
                </div>

                {/* Category */}
                <div className="md:col-span-2 flex justify-between md:justify-start items-center">
                  <span className="text-xs text-gray-500 md:hidden">
                    Category
                  </span>
                  <span className="text-sm text-gray-700">
                    {product.category}
                  </span>
                </div>

                {/* Form */}
                <div className="md:col-span-2 flex justify-between md:justify-start items-center">
                  <span className="text-xs text-gray-500 md:hidden">Form</span>
                  <span className="text-sm text-gray-700">
                    {product.productForm}
                  </span>
                </div>

                {/* Prescription */}
                <div className="md:col-span-2 flex justify-between md:justify-start items-center">
                  <span className="text-xs text-gray-500 md:hidden">
                    Prescription
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.prescription
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.prescription ? "Required" : "Not Required"}
                  </span>
                </div>

                {/* Price */}
                <div className="md:col-span-2 flex justify-between md:justify-start items-center">
                  <span className="text-xs text-gray-500 md:hidden">Price</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${product.price}
                  </span>
                </div>

                {/* Stock */}
                <div className="md:col-span-1 flex justify-between md:justify-start items-center">
                  <span className="text-xs text-gray-500 md:hidden">Stock</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock ? "In Stock" : "Out Stock"}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {(!products || products.length === 0) && !loading && <EmptyState />}

        {pageCount && pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ProductsContent />
    </Suspense>
  );
}
