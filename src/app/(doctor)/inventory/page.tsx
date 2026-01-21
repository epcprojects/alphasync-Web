"use client";

import OrderModal from "@/app/components/ui/modals/OrderModal";
import BlanketMarkupModal from "@/app/components/ui/modals/BlanketMarkupModal";
import {
  EmptyState,
  InventorySkeleton,
  ProductCard,
  ProductListView,
  Pagination,
  ThemeButton,
} from "@/components";
import {
  DeliveryBoxIcon,
  FavoriteIcon,
  GridViewIcon,
  HeartFilledIcon,
  ListViewIcon,
  SearchIcon,
  PackageOutlineIcon,
  ArrowDownIcon,
} from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import { CREATE_ORDER, TOGGLE_FAVOURITE, MARK_PRODUCT_NOT_FOR_SALE } from "@/lib/graphql/mutations";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  AllProductsResponse,
  Product,
  transformGraphQLProduct,
} from "@/types/products";

function InventoryContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [showGridView, setShowGridView] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [markupFilter, setMarkupFilter] = useState<string>("All");
  const [isBlanketMarkupModalOpen, setIsBlanketMarkupModalOpen] =
    useState(false);
  const [isRefetchingFavorites, setIsRefetchingFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    shopifyVariantId: string;
    title: string;
    price?: number;
    customPrice?: number;
  } | null>(null);

  const router = useRouter();
  const isMobile = useIsMobile();
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const markupFilterOptions = [
    { label: "All", value: "All" },
    { label: "Marked Up", value: "Marked Up" },
    { label: "Not Marked Up", value: "Not Marked Up" },
  ];

  const handleMarkupFilterChange = (filter: string) => {
    setMarkupFilter(filter);
    setCurrentPage(1);
  };

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset to first page when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to first page when out of stock filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [showOutOfStock]);

  // Reset to first page when favorites filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [showFavourites]);

  // Reset to first page when markup filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [markupFilter]);

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch,
  } = useQuery<AllProductsResponse>(ALL_PRODUCTS_INVENTORY, {
    variables: {
      search: debouncedSearch,
      page: currentPage, // Use currentPage directly (1-based pagination)
      perPage: itemsPerPage,
      inStockOnly: showOutOfStock ? false : undefined,
      favoriteProducts: showFavourites ? true : undefined,
      markedUp:
        markupFilter === "Marked Up"
          ? true
          : markupFilter === "Not Marked Up"
          ? false
          : undefined,
      notMarkedUp: markupFilter === "Not Marked Up" ? true : undefined,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  // GraphQL mutation to create order
  const [createOrder, { loading: createOrderLoading }] =
    useMutation(CREATE_ORDER);

  // GraphQL mutation to toggle favorite
  const [toggleFavorite] = useMutation(TOGGLE_FAVOURITE);

  // GraphQL mutation to mark product not for sale (revert to base, remove from customer catalog)
  const [markProductNotForSale] = useMutation(MARK_PRODUCT_NOT_FOR_SALE);

  // Transform GraphQL product data to match the expected format
  const products: Product[] =
    productsData?.allProducts.allData?.map(transformGraphQLProduct) || [];

  // Get pagination info from GraphQL response
  const pageCount = productsData?.allProducts.totalPages || 1;

  // All filtering is handled by the backend
  const displayProducts = products;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleToggleFavorite = async (productId: string) => {
    try {
      setIsRefetchingFavorites(true);
      await toggleFavorite({
        variables: {
          productId: productId,
        },
      });

      await refetch();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showErrorToast("Failed to update favorite status. Please try again.");
    } finally {
      setIsRefetchingFavorites(false);
    }
  };

  const handleRemoveFromSale = async (productId: string) => {
    try {
      await markProductNotForSale({
        variables: { productId },
      });
      await refetch();
      showSuccessToast("Product removed from sale. It’s back to base price and no longer available for customers to purchase.");
    } catch (error) {
      console.error("Error removing product from sale:", error);
      showErrorToast("Failed to remove from sale. Please try again.");
    }
  };

  const handleConfirmOrder = async (data: {
    customer: string;
    price: number;
    productId?: string;
    shopifyVariantId?: string;
    customerId?: string;
    useCustomPricing?: boolean;
  }) => {
    if (!selectedProduct || !data.productId || !data.shopifyVariantId) {
      showErrorToast("Product information is missing");
      return;
    }

    if (!data.customerId) {
      showErrorToast("Please select a customer");
      return;
    }

    try {
      // Use useCustomPricing from OrderModal, default to false if not provided
      const useCustomPricing = data.useCustomPricing ?? false;

      // Create order with single item
      await createOrder({
        variables: {
          orderItems: [
            {
              productId: data.productId,
              variantId: data.shopifyVariantId,
              quantity: 1,
              price: data.price,
            },
          ],
          totalPrice: data.price,
          patientId: data.customerId,
          useCustomPricing: useCustomPricing,
        },
      });

      // Only close modal after successful mutation
      setIsOrderModalOpen(false);
      setSelectedProduct(null);
      showSuccessToast("Order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
  };

  // Show error state
  if (productsError) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">{productsError.message}</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 md:gap-3">
            <h2 className="lg:w-full text-black font-semibold text-xl md:text-3xl lg:4xl">
              Peptide Inventory
            </h2>
            {!productsLoading && (
              <span className="flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 text-gray-700 text-sm md:text-base font-medium rounded-full">
                {productsData?.allProducts.count || 0}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:justify-end justify-center">
          <ThemeButton
            label="Apply Markup"
            onClick={() => setIsBlanketMarkupModalOpen(true)}
            icon={
              <PackageOutlineIcon
                height={isMobile ? "16" : "18"}
                width={isMobile ? "16" : "18"}
              />
            }
          />
          <div className="sm:bg-white rounded-full flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 sm:shadow-table lg:w-fit">
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
              <Menu>
                <MenuButton className="w-full sm:w-fit flex whitespace-nowrap justify-between py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-sm/6 font-medium shadow-inner focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                  {markupFilter} <ArrowDownIcon fill="#717680" />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className={`min-w-44 z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
                >
                  {markupFilterOptions.map((option) => (
                    <MenuItem key={option.value}>
                      <button
                        onClick={() => handleMarkupFilterChange(option.value)}
                        className="flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full"
                      >
                        {option.label}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>

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
      </div>
      {productsLoading && !isRefetchingFavorites ? (
        <InventorySkeleton viewMode={showGridView ? "grid" : "list"} />
      ) : (
        <div className="flex flex-col gap-4 md:gap-6">
          {showGridView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
              {displayProducts.map((product) => {
                // Find the original GraphQL product data using the originalId
                const originalProduct = productsData?.allProducts.allData?.find(
                  (p) => p.id === product.originalId
                );

                return (
                  <ProductCard
                    key={product.originalId}
                    product={product}
                    customPrice={originalProduct?.customPrice}
                    onAddToCart={() => {
                      if (originalProduct) {
                        setSelectedProduct({
                          id: originalProduct.id,
                          shopifyVariantId:
                            originalProduct.variants?.[0]?.shopifyVariantId ||
                            "",
                          title: originalProduct.title,
                          price: originalProduct.variants?.[0]?.price,
                          customPrice: originalProduct.customPrice,
                        });
                        setIsOrderModalOpen(true);
                      }
                    }}
                    onToggleFavourite={() => {
                      handleToggleFavorite(product.originalId);
                    }}
                    onRemoveFromSale={handleRemoveFromSale}
                    onCardClick={() =>
                      router.push(`/inventory/${product.originalId}`)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium bg-white rounded-xl text-black shadow-table">
                <div className="col-span-4 md:col-span-4 lg:col-span-4">
                  Product
                </div>
                <div className="col-span-2 md:col-span-2">Category</div>
                <div className="col-span-1">Stock</div>
                <div className="col-span-2">Latest Marked up Price</div>
                <div className="col-span-1">Base Price</div>
                <div className="col-span-1 md:col-span-2 lg:col-span-2 text-center">
                  Actions
                </div>
              </div>
              {displayProducts.map((product) => {
                // Find the original GraphQL product data using the originalId
                const originalProduct = productsData?.allProducts.allData?.find(
                  (p) => p.id === product.originalId
                );

                return (
                  <ProductListView
                    key={product.originalId}
                    onRowClick={() =>
                      router.push(`/inventory/${product.originalId}`)
                    }
                    product={product}
                    customPrice={originalProduct?.customPrice}
                    onToggleFavourite={() => {
                      handleToggleFavorite(product.originalId);
                    }}
                    onAddToCart={() => {
                      if (originalProduct) {
                        setSelectedProduct({
                          id: originalProduct.id,
                          shopifyVariantId:
                            originalProduct.variants?.[0]?.shopifyVariantId ||
                            "",
                          title: originalProduct.title,
                          price: originalProduct.variants?.[0]?.price,
                          customPrice: originalProduct.customPrice,
                        });
                        setIsOrderModalOpen(true);
                      }
                    }}
                    onRemoveFromSale={handleRemoveFromSale}
                  />
                );
              })}
            </div>
          )}

          <div className="flex justify-center flex-col gap-2 md:gap-6 ">
            {displayProducts.length < 1 && (
              <EmptyState mtClasses=" mt-0 md:mt-0" />
            )}

            {displayProducts.length > 0 && (
              <Pagination
                currentPage={currentPage - 1} // Convert 1-based to 0-based for pagination component
                totalPages={pageCount}
                onPageChange={(selectedPage) =>
                  handlePageChange(selectedPage + 1)
                } // Convert 0-based back to 1-based
              />
            )}
          </div>
        </div>
      )}

      <OrderModal
        key={selectedProduct?.id || "order-modal"}
        isOpen={isOrderModalOpen}
        onConfirm={handleConfirmOrder}
        productId={selectedProduct?.id}
        shopifyVariantId={selectedProduct?.shopifyVariantId}
        customPrice={selectedProduct?.customPrice}
        price={selectedProduct?.price}
        isLoading={createOrderLoading}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <BlanketMarkupModal
        isOpen={isBlanketMarkupModalOpen}
        onClose={() => setIsBlanketMarkupModalOpen(false)}
        onSuccess={() => {
          // Refetch products after successful markup
          refetch();
        }}
      />
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
