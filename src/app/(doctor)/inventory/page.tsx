"use client";

import OrderModal from "@/app/components/ui/modals/OrderModal";
import {
  EmptyState,
  InventorySkeleton,
  ProductCard,
  ProductListView,
  Pagination,
} from "@/components";
import {
  DeliveryBoxIcon,
  FavoriteIcon,
  GridViewIcon,
  HeartFilledIcon,
  ListViewIcon,
  SearchIcon,
} from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import { CREATE_ORDER, TOGGLE_FAVOURITE } from "@/lib/graphql/mutations";
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
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
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

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      // Reset to first page when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

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
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  // GraphQL mutation to create order
  const [createOrder, { loading: createOrderLoading }] =
    useMutation(CREATE_ORDER);

  // GraphQL mutation to toggle favorite
  const [toggleFavorite] = useMutation(TOGGLE_FAVOURITE);

  // Transform GraphQL product data to match the expected format
  const products: Product[] =
    productsData?.allProducts.allData?.map(transformGraphQLProduct) || [];

  // Get pagination info from GraphQL response
  const pageCount = productsData?.allProducts.totalPages || 1;

  // Apply only favorites filtering on the frontend (search is handled by backend)
  const displayProducts = showFavourites
    ? products.filter((p) => p.isFavourite)
    : products;

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

  const handleConfirmOrder = async (data: {
    customer: string;
    price: number;
    productId?: string;
    shopifyVariantId?: string;
    customerId?: string;
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
      // Check if price has been changed from original
      const originalPrice = selectedProduct?.price || 0;
      const useCustomPricing = data.price !== originalPrice;

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
            <h2 className="w-full text-black font-semibold text-lg md:text-2xl lg:3xl">
              Peptide Inventory
            </h2>
            {!productsLoading && (
              <span className="flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-full">
                {showFavourites
                  ? displayProducts.length
                  : productsData?.allProducts.count || 0}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-full w-full flex items-center gap-1 md:gap-2 p-1.5 md:px-2.5 md:py-2 shadow-table lg:w-fit">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <Tooltip content="Favourite Products">
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
      {productsLoading && !isRefetchingFavorites ? (
        <InventorySkeleton viewMode={showGridView ? "grid" : "list"} />
      ) : (
        <div className="flex flex-col gap-2 md:gap-6">
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
                    onCardClick={() =>
                      router.push(`/inventory/${product.originalId}`)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium bg-white rounded-xl text-black shadow-table">
                <div className="col-span-5 md:col-span-4 lg:col-span-5">
                  Product
                </div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-1 md:col-span-2 lg:col-span-1 text-center">
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
                  />
                );
              })}
            </div>
          )}

          <div className="flex justify-center flex-col gap-2 md:gap-6 ">
            {displayProducts.length < 1 && (
              <EmptyState mtClasses=" -mt-3 md:-mt-6" />
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
