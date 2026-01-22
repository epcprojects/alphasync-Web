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
import { useRouter } from "next/navigation";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import Tooltip from "@/app/components/ui/tooltip";
import { SYNC_PRODUCTS, EXPORT_PRODUCTS } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import {
  AllProductsResponse,
  Product,
  transformGraphQLProduct,
} from "@/types/products";
import ProductImage from "@/app/components/ui/ProductImage";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

// Interface for SyncProducts response
interface SyncProductsResponse {
  syncProducts: {
    message: string;
    productsCount: number;
    clientMutationId: string | null;
  };
}

function ProductsContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        category: selectedCategory === null ? null : selectedCategory || undefined,
      },
      fetchPolicy: "network-only",
    }
  );

  console.log("data", data);
  // GraphQL mutation for syncing products
  const [syncProducts] = useMutation<SyncProductsResponse>(SYNC_PRODUCTS);

  // GraphQL mutation to export products
  const [exportProducts, { loading: exportLoading }] = useMutation(EXPORT_PRODUCTS);

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

  const handleExportProducts = async () => {
    try {
      // Use current filter values from the page
      const { data } = await exportProducts({
        variables: {
          search: debouncedSearch || null,
          productType: null,
          category: selectedCategory || null,
          inStockOnly: showOutOfStock ? false : undefined,
          favoriteProducts: undefined,
          markedUp: undefined,
          notMarkedUp: undefined,
          patientId: null,
        },
      });

      if (data?.exportProducts?.csvData && data?.exportProducts?.fileName) {
        // API returns base64 encoded CSV data - decode it
        let csvContent: string;
        try {
          // Decode base64 to string
          csvContent = atob(data.exportProducts.csvData);
        } catch (e) {
          console.error("Error decoding base64 CSV data:", e);
          showErrorToast("Failed to decode CSV data. Please try again.");
          return;
        }

        // Add UTF-8 BOM for Excel compatibility
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
          type: "text/csv;charset=utf-8;",
        });

        // Create a download link
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          data.exportProducts.fileName || "products.csv"
        );
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);

        showSuccessToast("Products exported successfully!");
      } else {
        showErrorToast("Failed to export products. No data received.");
      }
    } catch (error) {
      console.error("Error exporting products:", error);
      showErrorToast("Failed to export products. Please try again.");
    }
  };

  const orderStatuses = [
    { label: "All Categories", value: null},
    { label: "Blood", value: "Blood" },
    { label: "Immunity", value: "Immunity" },
    { label: "Recovery", value: "Recovery" },
    { label: "Vial", value: "Vial" },
  ];

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
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="text-black font-semibold text-xl md:text-3xl lg:4xl">
              Products
            </h2>
            {data?.allProducts.count !== undefined && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                {data.allProducts.count}
              </span>
            )}
          </div>
        </div>

        <div className="sm:bg-white rounded-full w-full flex flex-col sm:flex-row items-center gap-1 md:gap-2 sm:p-1.5 md:px-2.5 md:py-2 sm:shadow-table lg:w-fit">
          <div className="flex items-center relative bg-white sm:p-0 sm:bg-transparent w-full sm:w-fit p-1 rounded-full  shadow-table sm:shadow-none">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          {/* <div className="relative">
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
          </div> */}

          <div className="flex items-center gap-1 p-1 rounded-full sm:bg-transparent sm:p-0 sm:shadow-none bg-white w-full shadow-table">
            <Menu>
              <MenuButton className="inline-flex py-2 px-3 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-sm md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                {orderStatuses.find((s) => s.value === selectedCategory)?.label || "All Categories"}
                <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {orderStatuses.map((status) => (
                  <MenuItem key={status.label}>
                    <button
                      onClick={() => {
                        setSelectedCategory(status.value);
                      }}
                      className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full`}
                    >
                      {status.label}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>

            <Tooltip content="Out of Stock">
              <button
                onClick={() => setShowOutOfStock((prev) => !prev)}
                className={`w-10 h-10 md:h-11 shrink-0 md:w-11 ${
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
              label="Export Products"
              onClick={handleExportProducts}
              disabled={exportLoading}
              className="w-full sm:w-fit"
            />

            {/* <ThemeButton
              label={
                isSyncing
                  ? "Syncing..."
                  : !isSyncing && isMobile
                  ? "Sync"
                  : "Sync Products"
              }
              icon={<ReloadIcon />}
              onClick={handleSyncProducts}
              disabled={isSyncing}
              className="w-full sm:w-fit"
            /> */}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="hidden sm:grid grid-cols-12 text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
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
                onClick={() =>
                  router.push(`/admin/products/${product.originalId}`)
                }
                className="flex flex-col md:grid md:grid-cols-12 gap-2 mb-2 md:gap-4 px-3 py-4 bg-white rounded-xl shadow-table hover:shadow-lg transition-shadow cursor-pointer"
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
                    <h3 className="font-medium line text-sm md:text-base text-black ">
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
                    {product.price}
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
