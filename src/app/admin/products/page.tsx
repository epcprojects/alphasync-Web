"use client";

import {
  PackageIcon,
  SearchIcon,
  ReloadIcon,
  PackageOutlineIcon,
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

  // GraphQL query to fetch products
  const { data, loading, error, refetch } = useQuery<AllProductsResponse>(
    ALL_PRODUCTS_INVENTORY,
    {
      variables: {
        search: debouncedSearch || undefined,
        page: currentPage + 1, // GraphQL uses 1-based pagination
        perPage: itemsPerPage,
        inStockOnly: showOutOfStock ? false : undefined,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <PackageIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Products
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-table w-fit">
          <div className="flex items-center relative">
            <span className="absolute left-3">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 min-w-80 focus:bg-white outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
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
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
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
                key={product.id}
                className="grid grid-cols-12 gap-4 px-2 py-3 bg-white rounded-xl shadow-table hover:shadow-lg transition-shadow"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <ProductImage
                    width={60}
                    height={60}
                    src={product.image}
                    alt={product.title}
                    className="h-full object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm md:text-base text-black truncate">
                      {product.title}
                    </h3>
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-700">
                    {product.category}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-700">
                    {product.productForm}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
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
                <div className="col-span-2 flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    ${product.price}
                  </span>
                </div>
                <div className="col-span-1 flex items-center">
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
