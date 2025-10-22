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
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
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
  const [showFavourites, setShowFavourites] = useState(false);
  const [showGridView, setShowGridView] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    shopifyVariantId: string;
    title: string;
    price?: number;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const itemsPerPage = 9;

  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // GraphQL query to fetch products with pagination
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch,
  } = useQuery<AllProductsResponse>(ALL_PRODUCTS_INVENTORY, {
    variables: {
      page: currentPage + 1, // GraphQL pagination is 1-based
      perPage: itemsPerPage,
    },
    fetchPolicy: "network-only",
  });

  // GraphQL mutation to create order
  const [
    createOrder,
    { loading: createOrderLoading },
  ] = useMutation(CREATE_ORDER);

  // GraphQL mutation to toggle favorite
  const [
    toggleFavorite,
  ] = useMutation(TOGGLE_FAVOURITE);

  // Transform GraphQL product data to match the expected format
  const products: Product[] =
    productsData?.allProducts.allData?.map(transformGraphQLProduct) || [];

  // Get pagination info from GraphQL response
  const pageCount = productsData?.allProducts.totalPages || 1;

  // Apply client-side filtering for search and favorites
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());

    const matchesFavourite = showFavourites ? p.isFavourite : true;

    return matchesSearch && matchesFavourite;
  });

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const handleToggleFavorite = async (productId: string) => {
    try {
      await toggleFavorite({
        variables: {
          productId: productId,
        },
      });
      
      // Refetch the products to get updated favorite status
      await refetch();
     
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showErrorToast("Failed to update favorite status. Please try again.");
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
      // Create order with single item
      await createOrder({
        variables: {
          orderItems: [{
            productId: data.productId,
            variantId: data.shopifyVariantId,
            quantity: 1,
            price: data.price,
          }],
          totalPrice: data.price,
          patientId: data.customerId,
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
          <h2 className="w-full text-black font-semibold text-lg md:text-2xl lg:3xl">
            Peptide Inventory
          </h2>
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
      {productsLoading  ? <InventorySkeleton /> : (
        <div className="flex flex-col gap-2 md:gap-6">
        {showGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(id) => {
                  // Find the transformed product to get the originalId
                  const transformedProduct = filteredProducts.find(p => p.id === id);
                  if (transformedProduct) {
                    // Find the original GraphQL product data
                    const originalProduct = productsData?.allProducts.allData?.find(p => p.id === transformedProduct.originalId);
                    if (originalProduct) {
                      setSelectedProduct({
                        id: originalProduct.id,
                        shopifyVariantId: originalProduct.variants?.[0]?.shopifyVariantId || "",
                        title: originalProduct.title,
                        price: originalProduct.variants?.[0]?.price,
                      });
                      setIsOrderModalOpen(true);
                    }
                  }
                }}
                onToggleFavourite={(id) => {
                  // Find the transformed product to get the originalId
                  const transformedProduct = filteredProducts.find(p => p.id === id);
                  if (transformedProduct) {
                    handleToggleFavorite(transformedProduct.originalId);
                  }
                }}
                onCardClick={() => router.push(`/inventory/${product.originalId}`)}
              />
            ))}
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
            {filteredProducts.map((product) => (
              <ProductListView
                onRowClick={() => router.push(`/inventory/${product.originalId}`)}
                key={product.id}
                product={product}
                onToggleFavourite={(id) => {
                  // Find the transformed product to get the originalId
                  const transformedProduct = filteredProducts.find(p => p.id === id);
                  if (transformedProduct) {
                    handleToggleFavorite(transformedProduct.originalId);
                  }
                }}
                onAddToCart={(id) => {
                  // Find the transformed product to get the originalId
                  const transformedProduct = filteredProducts.find(p => p.id === id);
                  if (transformedProduct) {
                    // Find the original GraphQL product data
                    const originalProduct = productsData?.allProducts.allData?.find(p => p.id === transformedProduct.originalId);
                    if (originalProduct) {
                      setSelectedProduct({
                        id: originalProduct.id,
                        shopifyVariantId: originalProduct.variants?.[0]?.shopifyVariantId || "",
                        title: originalProduct.title,
                        price: originalProduct.variants?.[0]?.price,
                      });
                      setIsOrderModalOpen(true);
                    }
                  }
                }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-center flex-col gap-2 md:gap-6 ">
          {filteredProducts.length < 1 && (
            <EmptyState mtClasses=" -mt-3 md:-mt-6" />
          )}

          {filteredProducts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pageCount}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      )}

      

      <OrderModal
        isOpen={isOrderModalOpen}
        onConfirm={handleConfirmOrder}
        productId={selectedProduct?.id}
        shopifyVariantId={selectedProduct?.shopifyVariantId}
        defaultPrice={selectedProduct?.price}
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
