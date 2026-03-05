"use client";

import {
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
import AppModal from "@/app/components/ui/modals/AppModal";
import { Menu, MenuItem, MenuItems } from "@headlessui/react";
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
    parseInt(searchParams.get("page") || "1", 10) - 1,
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    orderCategories[0].label,
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  /** When set, show modal to select unit pricing before opening request modal (products with productUnitPricings). */
  const [unitPricingModal, setUnitPricingModal] = useState<{
    product: Product;
    productId: string;
    productName: string;
    productUnitPricings: Array<{
      id: string;
      price?: unknown;
      quantity: number;
      strength?: string | null;
    }>;
  } | null>(null);
  const [selectedUnitPricingIndex, setSelectedUnitPricingIndex] = useState(0);
  /** Set when user selects a unit pricing; used in handleConfirmOrder. */
  const [selectedProductUnitPricingId, setSelectedProductUnitPricingId] =
    useState<string | null>(null);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState<number | null>(
    null,
  );

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

  const parseUnitPrice = (p: unknown): number => {
    if (typeof p === "number" && !Number.isNaN(p)) return p;
    if (
      p &&
      typeof p === "object" &&
      "parsedValue" in p &&
      typeof (p as { parsedValue?: number }).parsedValue === "number"
    )
      return (p as { parsedValue: number }).parsedValue;
    if (typeof p === "string") return parseFloat(p) || 0;
    return 0;
  };

  const handleConfirmOrder = async (reason: string) => {
    if (!selectedProduct || !doctorData?.fetchUser?.user?.doctor?.id) {
      showErrorToast(
        "Please select a product and ensure you have a doctor assigned.",
      );
      return;
    }

    try {
      const doctorId = doctorData.fetchUser.user.doctor.id;

      // Get the product details from GraphQL to get variant information
      const originalProduct = productsData?.allProducts.allData?.find(
        (p) => p.id === selectedProduct.originalId,
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
      const unitPrice =
        selectedUnitPrice != null && selectedUnitPrice > 0
          ? selectedUnitPrice
          : firstVariant.price;
      const requestedItems = [
        {
          productId: selectedProduct.originalId,
          variantId: firstVariant.shopifyVariantId || firstVariant.id,
          quantity: 1,
          price: unitPrice,
          ...(selectedProductUnitPricingId != null &&
          selectedProductUnitPricingId !== ""
            ? { productUnitPricingId: selectedProductUnitPricingId }
            : {}),
        },
      ];

      console.log("requestedItems", requestedItems);

      const result = await requestOrder({
        variables: {
          doctorId,
          reason,
          requestedItems,
        },
      });

      setIsOrderModalOpen(false);
      setSelectedProductUnitPricingId(null);
      setSelectedUnitPrice(null);
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
    const rawProduct = productsData?.allProducts.allData?.find(
      (p) => p.id === product.originalId,
    );
    const unitPricings = rawProduct?.productUnitPricings;
    if (unitPricings && unitPricings.length > 0) {
      setUnitPricingModal({
        product,
        productId: product.originalId,
        productName: product.title,
        productUnitPricings: unitPricings,
      });
      setSelectedUnitPricingIndex(0);
      return;
    }
    setSelectedProductUnitPricingId(null);
    setSelectedUnitPrice(null);
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
          <h2 className="lg:w-full text-black font-semibold text-xl md:text-3xl lg:4xl">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 bg-gray-100 w-full focus:bg-white md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-4 md:gap-6">
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
              <div className="hidden sm:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium bg-white rounded-xl text-black shadow-table">
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
      <AppModal
        isOpen={!!unitPricingModal}
        onClose={() => setUnitPricingModal(null)}
        title="Select unit pricing"
        subtitle=""
        onConfirm={() => {
          if (!unitPricingModal) return;
          const tier =
            unitPricingModal.productUnitPricings[selectedUnitPricingIndex];
          if (!tier) return;
          const unitPrice = parseUnitPrice(tier.price);
          setSelectedProductUnitPricingId(tier.id);
          setSelectedUnitPrice(unitPrice);
          setUnitPricingModal(null);
          setIsOrderModalOpen(true);
        }}
        confirmLabel="Continue to request"
        cancelLabel="Cancel"
        confirmBtnVarient="filled"
        bodyPaddingClasses="p-4 md:p-6"
      >
        {unitPricingModal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Choose a unit pricing for &quot;{unitPricingModal.productName}
              &quot;
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th
                      className="text-left py-2 px-3 w-8 font-medium text-gray-600"
                      aria-hidden="true"
                    />
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Quantity
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">
                      Strength
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">
                      Price per unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unitPricingModal.productUnitPricings.map((tier, index) => {
                    const price = parseUnitPrice(tier.price);
                    const isSelected = selectedUnitPricingIndex === index;
                    return (
                      <tr
                        key={tier.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedUnitPricingIndex(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedUnitPricingIndex(index);
                          }
                        }}
                        className={`border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? "bg-primary-50" : ""}`}
                      >
                        <td className="py-2 px-3 w-8">
                          {isSelected ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                              <svg
                                className="h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-block h-5 w-5" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-800">
                          {tier.quantity}
                        </td>
                        <td className="py-2 px-3 text-gray-800">
                          {tier.strength ?? "—"}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-900">
                          ${price.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AppModal>

      <RequestModel
        isOpen={isOrderModalOpen}
        onConfirm={async ({ reason }) => {
          await handleConfirmOrder(reason);
        }}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedProductUnitPricingId(null);
          setSelectedUnitPrice(null);
        }}
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
