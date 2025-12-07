"use client";

import {
  FilterIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
  ShopingCartFilledicon,
} from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import Pagination from "@/app/components/ui/Pagination";
import { useIsMobile } from "@/hooks/useIsMobile";
import BrowserProductCard from "@/app/components/ui/cards/BrowserProductCard";
import RequestModel from "@/app/components/ui/modals/RequestModel";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import BrowseProductListView from "@/app/components/ui/cards/BrowseProductListView";
import ProductDetails from "@/app/components/ui/modals/ProductDetails";
import Tooltip from "@/app/components/ui/tooltip";
import { EmptyState } from "@/app/components";
import InventorySkeleton from "@/app/components/ui/InventorySkeleton";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_PRODUCTS_INVENTORY, FETCH_DOCTOR } from "@/lib/graphql/queries";
import { REQUEST_ORDER } from "@/lib/graphql/mutations";
import {
  AllProductsResponse,
  Product,
  transformGraphQLProduct,
} from "@/types/products";
import { showErrorToast } from "@/lib/toast";

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
  // URL uses 1-based pagination, convert to 0-based for internal use
  const initialPage = Math.max(
    0,
    parseInt(searchParams.get("page") || "1", 10) - 1
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    orderCategories[0].label
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // GraphQL query to fetch doctor data
  const { data: doctorData } = useQuery(FETCH_DOCTOR, {
    fetchPolicy: "network-only",
  });

  // GraphQL mutation for requesting order
  const [requestOrder] = useMutation(REQUEST_ORDER);

  // GraphQL query to fetch products with search and pagination
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<AllProductsResponse>(ALL_PRODUCTS_INVENTORY, {
    variables: {
      search: search || undefined,
      page: currentPage + 1, // GraphQL uses 1-based pagination
      perPage: itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  // Transform GraphQL product data to match the expected format
  const products: Product[] =
    productsData?.allProducts.allData?.map(transformGraphQLProduct) || [];

  // Filter by category on frontend since GraphQL doesn't support category filtering
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All Categories" || p.category === selectedCategory;
    return matchesCategory;
  });

  // Use GraphQL pagination data
  const pageCount = productsData?.allProducts.totalPages || 1;
  const currentItems = filteredProducts;

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected + 1)); // Convert 0-based to 1-based for URL
    router.replace(`?${params.toString()}`);
  };

  const handleConfirmOrder = async (reason: string) => {
    if (!selectedProduct || !doctorData?.fetchUser?.user?.doctor?.id) {
      showErrorToast(
        "Please select a product and ensure you have a doctor assigned."
      );
      return;
    }

    try {
      const doctorId = doctorData.fetchUser.user.doctor.id;

      // Get the product details from GraphQL to get variant information
      const originalProduct = productsData?.allProducts.allData?.find(
        (p) => p.id === selectedProduct.originalId
      );

      if (
        !originalProduct ||
        !originalProduct.variants ||
        originalProduct.variants.length === 0
      ) {
        showErrorToast("Product variant information is missing");
        return;
      }

      const firstVariant = originalProduct.variants[0];
      const requestedItems = [
        {
          productId: selectedProduct.originalId,
          variantId: firstVariant.shopifyVariantId || firstVariant.id,
          quantity: 1,
          price: firstVariant.price,
        },
      ];

      const result = await requestOrder({
        variables: {
          doctorId,
          reason,
          requestedItems,
        },
      });

      console.log("Order request result:", result);
      setIsOrderModalOpen(false);
      showSuccessToast("Order request sent successfully!");
    } catch (error) {
      console.error("Error in request order:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send order request. Please try again.";
      showErrorToast(errorMessage);
    }
  };
  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  // Show loading state

  // Show error state
  if (productsError) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">
            Error loading products: {productsError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <ShopingCartFilledicon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="lg:w-full text-black font-semibold text-lg md:text-2xl lg:3xl">
            Browse Products
          </h2>
          <div className="px-2.5 py-0.5 rounded-full bg-white border border-indigo-200">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              {productsData?.allProducts.count || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-full w-full flex items-center gap-1 md:gap-2 p-1.5  md:px-2.5 md:py-2 shadow-table lg:w-fit">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 bg-gray-100 w-full focus:bg-white md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <Menu>
            {/* <Tooltip content="Filter by category">
              <MenuButton className="h-8 w-8 md:h-11 md:w-11 shrink-0 flex justify-center cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full  text-sm/6 font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                <FilterIcon />
              </MenuButton>
            </Tooltip> */}

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

          <Tooltip content="Griw View">
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
      {productsLoading ? (
        <InventorySkeleton />
      ) : (
        <div className="flex flex-col gap-2 md:gap-6">
          {showGridView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
              {currentItems.map((product) => (
                <BrowserProductCard
                  key={product.originalId}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium bg-white rounded-xl text-black shadow-table">
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
                  key={product.originalId}
                  product={product}
                  onInfoBtn={handleCardClick}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-center flex-col gap-2 md:gap-6 ">
            {currentItems.length < 1 && (
              <EmptyState mtClasses="-mt-3 md:-mt-6" />
            )}

            {currentItems.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pageCount || 1}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}
      <RequestModel
        isOpen={isOrderModalOpen}
        onConfirm={async ({ reason }) => {
          await handleConfirmOrder(reason);
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
    <Suspense fallback={<InventorySkeleton />}>
      <InventoryContent />
    </Suspense>
  );
}
