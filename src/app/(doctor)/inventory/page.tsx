"use client";

import OrderModal from "@/app/components/ui/modals/OrderModal";
import BlanketMarkupModal from "@/app/components/ui/modals/BlanketMarkupModal";
import {
  EmptyState,
  InventorySkeleton,
  ProductCard,
  ProductListView,
  ThemeButton,
  PriceModal,
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
  InfoIcon,
  InfoFilledIcon,
} from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import React, { Suspense, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Tooltip from "@/app/components/ui/tooltip";
import { useQuery, useMutation } from "@apollo/client/react";
import { NetworkStatus } from "@apollo/client";
import {
  ALL_PRODUCTS_INVENTORY,
  ALL_CATEGORIES,
} from "@/lib/graphql/queries";

const PHARMACY_VENDORS = [
  "Integrity",
  "City Center",
  "Greenwich",
  "Integrity B",
];

const ALPHA_BIOMED_VENDORS = ["Alpha BioMed"];
import {
  CREATE_ORDER,
  TOGGLE_FAVOURITE,
  EXPORT_PRODUCTS,
  MARK_PRODUCT_NOT_FOR_SALE,
  UPDATE_PRODUCT_PRICE,
} from "@/lib/graphql/mutations";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  AllProductsResponse,
  Product,
  transformGraphQLProduct,
} from "@/types/products";
import { useAppSelector } from "@/lib/store/hooks";

function InventoryContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [showGridView, setShowGridView] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showPricModal, setShowPriceModal] = useState(false);
  const [markupFilter, setMarkupFilter] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inventoryTab, setInventoryTab] = useState<
    "research-use-only" | "pharmacy"
  >("research-use-only");
  const [isBlanketMarkupModalOpen, setIsBlanketMarkupModalOpen] =
    useState(false);
  const [isRefetchingFavorites, setIsRefetchingFavorites] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    shopifyVariantId: string;
    title: string;
    price?: number;
    customPrice?: number | null;
    imageUrl?: string | null;
    vendor?: string | null;
  } | null>(null);

  const router = useRouter();
  const isMobile = useIsMobile();
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  type AllDataItem = AllProductsResponse["allProducts"]["allData"][number];
  const [loadedAllData, setLoadedAllData] = useState<AllDataItem[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const userEmail = useAppSelector((state) => state.auth.user?.email);

  const markupFilterOptions = [
    { label: "All", value: "All" },
    { label: "Marked Up", value: "Marked Up" },
    { label: "Not Marked Up", value: "Not Marked Up" },
  ];

  const clearLoadedAndResetPage = () => {
    setLoadedAllData([]);
    setCurrentPage(1);
    setIsLoadingMore(false);
  };

  const handleMarkupFilterChange = (filter: string) => {
    setMarkupFilter(filter);
    clearLoadedAndResetPage();
  };

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      clearLoadedAndResetPage();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset loaded list and page when any filter changes
  useEffect(() => {
    clearLoadedAndResetPage();
  }, [showOutOfStock, showFavourites, markupFilter, selectedCategory, inventoryTab]);

  // GraphQL query to fetch categories
  const { data: categoriesData } = useQuery<{ allCategories: string[] }>(
    ALL_CATEGORIES,
    { fetchPolicy: "network-only" },
  );
  const categories = categoriesData?.allCategories ?? [];

  const queryVariables = {
    search: debouncedSearch,
    page: 1,
    perPage: itemsPerPage,
    inStockOnly: showOutOfStock ? false : undefined,
    category: selectedCategory ?? undefined,
    vendor:
      inventoryTab === "research-use-only"
        ? ALPHA_BIOMED_VENDORS
        : inventoryTab === "pharmacy"
          ? PHARMACY_VENDORS
          : undefined,
    favoriteProducts: showFavourites ? true : undefined,
    markedUp:
      markupFilter === "Marked Up"
        ? true
        : markupFilter === "Not Marked Up"
          ? false
          : undefined,
    notMarkedUp: markupFilter === "Not Marked Up" ? true : undefined,
  };

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch,
    fetchMore: fetchMoreProducts,
    networkStatus,
  } = useQuery<AllProductsResponse>(ALL_PRODUCTS_INVENTORY, {
    variables: queryVariables,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const hasNoDataYet = !productsData?.allProducts?.allData?.length && !loadedAllData.length;
  const isInitialLoading = hasNoDataYet && (productsLoading || networkStatus === NetworkStatus.loading);

  // GraphQL mutation to create order
  const [createOrder, { loading: createOrderLoading }] =
    useMutation(CREATE_ORDER);

  // GraphQL mutation to toggle favorite
  const [toggleFavorite] = useMutation(TOGGLE_FAVOURITE);

  // GraphQL mutation to export products
  const [exportProducts, { loading: exportLoading }] =
    useMutation(EXPORT_PRODUCTS);

  // GraphQL mutation to remove product from sale (Pharmacy / Integrity toggle off)
  const [markProductNotForSale] = useMutation(MARK_PRODUCT_NOT_FOR_SALE);

  // GraphQL mutation to set product price (Pharmacy / Integrity toggle on – use displayed price)
  const [updateProductPrice] = useMutation(UPDATE_PRODUCT_PRICE);

  // Get pagination info from GraphQL response
  const pageCount = productsData?.allProducts.totalPages || 1;
  const hasMorePages = currentPage < pageCount;

  const displayAllData =
    loadedAllData.length > 0
      ? loadedAllData
      : (productsData?.allProducts.allData ?? []);
  const displayProducts = displayAllData.map(transformGraphQLProduct);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    if (currentPage === 1 && loadedAllData.length === 0) {
      setLoadedAllData(productsData?.allProducts.allData ?? []);
    }
    setIsLoadingMore(true);
    fetchMoreProducts({
      variables: { ...queryVariables, page: nextPage },
    })
      .then((result) => {
        if (result.data?.allProducts?.allData?.length) {
          setLoadedAllData((prev) => [
            ...prev,
            ...result.data.allProducts.allData,
          ]);
          setCurrentPage(nextPage);
        }
      })
      .finally(() => setIsLoadingMore(false));
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
      await markProductNotForSale({ variables: { productId } });
      await refetch();
      showSuccessToast(
        "Product removed from your store. It’s back to base price and no longer available for customers to purchase.",
      );
    } catch (error) {
      console.error("Error removing product from sale:", error);
      showErrorToast("Failed to remove from sale. Please try again.");
    }
  };

  /** Get the same numeric price displayed on card/list (unit pricing → customPrice → variant price) */
  const getDisplayPriceValue = (
    p: AllProductsResponse["allProducts"]["allData"][number] | undefined
  ): number => {
    if (!p) return 0;
    const firstUnit =
      p.productUnitPricings?.[0]?.price != null
        ? typeof p.productUnitPricings[0].price === "number"
          ? p.productUnitPricings[0].price
          : parseFloat(String(p.productUnitPricings[0].price))
        : NaN;
    if (!Number.isNaN(firstUnit)) return firstUnit;
    if (p.customPrice != null && p.customPrice !== undefined) return p.customPrice;
    return p.variants?.[0]?.price ?? 0;
  };

  const handleAddToStoreWithPrice = async (productId: string, price: number) => {
    try {
      await updateProductPrice({
        variables: { productId, price },
      });
      await refetch();
      showSuccessToast("Product added to your store.");
    } catch (error) {
      console.error("Error adding product to store:", error);
      showErrorToast("Failed to add to store. Please try again.");
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
          vendor:
            inventoryTab === "research-use-only"
              ? ALPHA_BIOMED_VENDORS
              : inventoryTab === "pharmacy"
                ? PHARMACY_VENDORS
                : undefined,
          inStockOnly: showOutOfStock ? false : undefined,
          favoriteProducts: showFavourites ? true : undefined,
          markedUp:
            markupFilter === "Marked Up"
              ? true
              : markupFilter === "Not Marked Up"
                ? false
                : undefined,
          notMarkedUp: markupFilter === "Not Marked Up" ? true : undefined,
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
          data.exportProducts.fileName || "products.csv",
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
              Inventory
            </h2>
            {/* {!productsLoading && (
              <span className="flex items-center justify-center px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 text-gray-700 text-sm md:text-base font-medium rounded-full">
                {productsData?.allProducts.count || 0}
              </span>
            )} */}
            <Tooltip
              autoShowOnceKey={userEmail}
              side="bottom"
              content="Click Add to My Store, enter your selling price, and click Save. The product will be added to your store."
            >
              <InfoFilledIcon />
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:justify-end justify-center">
          <ThemeButton
            label="Export Products"
            onClick={handleExportProducts}
            disabled={exportLoading}
          />
          {inventoryTab === "research-use-only" && (
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
          )}
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

              <Menu>
                <MenuButton className="w-full sm:w-fit flex whitespace-nowrap justify-between py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-sm/6 font-medium shadow-inner focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                  {selectedCategory ?? "All Categories"}
                  <ArrowDownIcon fill="#717680" />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className={`min-w-32 md:min-w-44 z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 h-60 overflow-y-auto`}
                >
                  <MenuItem>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full"
                    >
                      All Categories
                    </button>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full"
                      >
                        {category}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>

              <Tooltip content="Favorite Products">
                <button
                  onClick={() => setShowFavourites((prev) => !prev)}
                  className={`w-8 h-8 shrink-0 md:h-11 md:w-11 ${showFavourites &&
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
                  className={`w-8 h-8 md:h-11 shrink-0 md:w-11 ${showOutOfStock &&
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
                  className={`w-8 h-8 md:h-11 shrink-0 md:w-11 ${showGridView &&
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
                  className={`w-8 h-8 md:h-11 shrink-0 md:w-11 ${!showGridView &&
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
      {/* Tabs: Research Use Only / Pharmacy */}
      <TabGroup
        selectedIndex={inventoryTab === "research-use-only" ? 0 : 1}
        onChange={(index) =>
          setInventoryTab(index === 0 ? "research-use-only" : "pharmacy")
        }
      >
        <TabList className="flex w-fit items-center gap-1 rounded-full bg-gray-100 p-1 shadow-table overflow-x-auto">
          <Tab
            className={({ selected }) =>
              `whitespace-nowrap px-4 md:px-6 py-2.5 text-sm font-medium rounded-full transition-colors outline-none ${selected
                ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            Research Use Only
          </Tab>
          <Tab
            className={({ selected }) =>
              `whitespace-nowrap px-4 md:px-6 py-2.5 text-sm font-medium rounded-full transition-colors outline-none ${selected
                ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
              }`
            }
          >
            Pharmacy
          </Tab>
        </TabList>

        <TabPanels className="mt-4">
          <TabPanel className="focus:outline-none">
            {isInitialLoading && !isRefetchingFavorites ? (
              <InventorySkeleton viewMode={showGridView ? "grid" : "list"} />
            ) : (
              <div className="flex flex-col gap-4 md:gap-6">
                {showGridView ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
                    {displayProducts.map((product) => {
                      // Find the original GraphQL product data using the originalId
                      const originalProduct =
                        displayAllData.find(
                          (p) => p.id === product.originalId,
                        );
                      const isMarkedUp =
                        originalProduct?.customPrice != null &&
                        originalProduct?.customPrice !== undefined;
                      // Only Alpha BioMed (RUO) products can be added to shop / ordered
                      const canOrder =
                        originalProduct?.vendor === "Alpha BioMed";
                      return (
                        <ProductCard
                          key={product.originalId}
                          product={product}
                          customPrice={originalProduct?.customPrice}
                          orderButtonDisabled={!canOrder}
                          vendor={originalProduct?.vendor}
                          pendingApproval={!canOrder}
                          onBtnClick={() => {
                            // Not marked up -> Add to My Store
                            // Marked up -> Change Customer Price
                            if (!originalProduct) {
                              showErrorToast("Product information is missing");
                              return;
                            }
                            const firstVariant = originalProduct.variants?.[0];
                            setSelectedProduct({
                              id: originalProduct.id,
                              shopifyVariantId:
                                firstVariant?.shopifyVariantId || "",
                              title: originalProduct.title,
                              price: firstVariant?.price ?? 0,
                              customPrice: originalProduct.customPrice ?? null,
                              imageUrl: originalProduct.primaryImage ?? null,
                              vendor: originalProduct.vendor,
                            });
                            setShowPriceModal(true);
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
                    <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium bg-white rounded-xl text-black shadow-table">
                      <div className="col-span-4 md:col-span-4 lg:col-span-4">
                        Product
                      </div>
                      <div className="col-span-2 md:col-span-2">Category</div>
                      <div className="col-span-1">Stock</div>
                      {inventoryTab === "research-use-only" && (
                        <div className="col-span-2">Latest Marked up Price</div>
                      )}
                      <div className="col-span-1">Base Price</div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-2 text-center">
                        Actions
                      </div>
                    </div>
                    {displayProducts.map((product) => {
                      // Find the original GraphQL product data using the originalId
                      const originalProduct =
                        displayAllData.find(
                          (p) => p.id === product.originalId,
                        );
                      // Only Alpha BioMed (RUO) products can be added to shop / ordered
                      const canOrder =
                        originalProduct?.vendor === "Alpha BioMed";

                      return (
                        <ProductListView
                          key={product.originalId}
                          onRowClick={() =>
                            router.push(`/inventory/${product.originalId}`)
                          }
                          product={product}
                          customPrice={originalProduct?.customPrice}
                          orderButtonDisabled={!canOrder}
                          vendor={originalProduct?.vendor}
                          pendingApproval={!canOrder}
                          onToggleFavourite={() => {
                            handleToggleFavorite(product.originalId);
                          }}
                          onBtnClick={() => {
                            if (!originalProduct) {
                              showErrorToast("Product information is missing");
                              return;
                            }
                            const firstVariant = originalProduct.variants?.[0];
                            setSelectedProduct({
                              id: originalProduct.id,
                              shopifyVariantId:
                                firstVariant?.shopifyVariantId || "",
                              title: originalProduct.title,
                              price: firstVariant?.price ?? 0,
                              customPrice: originalProduct.customPrice ?? null,
                              imageUrl: originalProduct.primaryImage ?? null,
                              vendor: originalProduct.vendor,
                            });
                            setShowPriceModal(true);
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-center flex-col gap-2 md:gap-6 ">
                  {displayProducts.length < 1 && (
                    <EmptyState mtClasses=" mt-0 md:mt-0" />
                  )}

                  {displayProducts.length > 0 && hasMorePages && (
                    <div className="flex justify-center pt-2">
                      <ThemeButton
                        variant="filled"
                        label={isLoadingMore ? "Loading…" : "Load more products"}
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="min-w-[140px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabPanel>
          <TabPanel className="focus:outline-none">
            {isInitialLoading && !isRefetchingFavorites ? (
              <InventorySkeleton viewMode={showGridView ? "grid" : "list"} />
            ) : (
              <div className="flex flex-col gap-4 md:gap-6">
                {showGridView ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3  gap-2 md:gap-6">
                    {displayProducts.map((product) => {
                      const originalProduct =
                        displayAllData.find(
                          (p) => p.id === product.originalId,
                        );
                      // Pharmacy (Integrity): toggle for My Store; on enable, set price to displayed price
                      return (
                        <ProductCard
                          key={product.originalId}
                          product={product}
                          customPrice={originalProduct?.customPrice}
                          vendor={originalProduct?.vendor}
                          pendingApproval={false}
                          useAddToStoreToggle
                          displayPriceValue={getDisplayPriceValue(originalProduct ?? undefined)}
                          onAddToStoreWithPrice={handleAddToStoreWithPrice}
                          onRemoveFromSale={handleRemoveFromSale}
                          onBtnClick={() => {
                            if (!originalProduct) {
                              showErrorToast("Product information is missing");
                              return;
                            }
                            const firstVariant = originalProduct.variants?.[0];
                            setSelectedProduct({
                              id: originalProduct.id,
                              shopifyVariantId:
                                firstVariant?.shopifyVariantId || "",
                              title: originalProduct.title,
                              price: firstVariant?.price ?? 0,
                              customPrice: originalProduct.customPrice ?? null,
                              imageUrl: originalProduct.primaryImage ?? null,
                              vendor: originalProduct.vendor,
                            });
                            setShowPriceModal(true);
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
                    <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-2.5 text-sm font-medium bg-white rounded-xl text-black shadow-table">
                      <div className="col-span-4 md:col-span-4 lg:col-span-4">
                        Product
                      </div>
                      <div className="col-span-2 md:col-span-2">Category</div>
                      <div className="col-span-1">Stock</div>
                      {inventoryTab === "research-use-only" && (
                        <div className="col-span-2">Latest Marked up Price</div>
                      )}
                      <div className="col-span-1">Base Price</div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-2 text-center">
                        Actions
                      </div>
                    </div>
                    {displayProducts.map((product) => {
                      const originalProduct =
                        displayAllData.find(
                          (p) => p.id === product.originalId,
                        );
                      // Pharmacy (Integrity): toggle for My Store; on enable, set price to displayed price
                      return (
                        <ProductListView
                          key={product.originalId}
                          onRowClick={() =>
                            router.push(`/inventory/${product.originalId}`)
                          }
                          product={product}
                          customPrice={originalProduct?.customPrice}
                          vendor={originalProduct?.vendor}
                          pendingApproval={false}
                          useAddToStoreToggle
                          displayPriceValue={getDisplayPriceValue(originalProduct ?? undefined)}
                          onAddToStoreWithPrice={handleAddToStoreWithPrice}
                          onRemoveFromSale={handleRemoveFromSale}
                          onToggleFavourite={() =>
                            handleToggleFavorite(product.originalId)
                          }
                          onBtnClick={() => {
                            if (!originalProduct) {
                              showErrorToast("Product information is missing");
                              return;
                            }
                            const firstVariant = originalProduct.variants?.[0];
                            setSelectedProduct({
                              id: originalProduct.id,
                              shopifyVariantId:
                                firstVariant?.shopifyVariantId || "",
                              title: originalProduct.title,
                              price: firstVariant?.price ?? 0,
                              customPrice: originalProduct.customPrice ?? null,
                              imageUrl: originalProduct.primaryImage ?? null,
                              vendor: originalProduct.vendor,
                            });
                            setShowPriceModal(true);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-center flex-col gap-2 md:gap-6 ">
                  {displayProducts.length < 1 && (
                    <EmptyState mtClasses=" mt-0 md:mt-0" />
                  )}
                  {displayProducts.length > 0 && hasMorePages && (
                    <div className="flex justify-center pt-2">
                      <ThemeButton
                        variant="filled"
                        label={isLoadingMore ? "Loading…" : "Load more products"}
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="min-w-[140px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <OrderModal
        key={selectedProduct?.id || "order-modal"}
        isOpen={isOrderModalOpen}
        onConfirm={handleConfirmOrder}
        productId={selectedProduct?.id}
        shopifyVariantId={selectedProduct?.shopifyVariantId}
        customPrice={selectedProduct?.customPrice ?? undefined}
        price={selectedProduct?.price}
        isLoading={createOrderLoading}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <PriceModal
        isOpen={showPricModal}
        onClose={() => setShowPriceModal(false)}
        product={
          selectedProduct
            ? {
              id: selectedProduct.id,
              title: selectedProduct.title,
              imageUrl: selectedProduct.imageUrl,
              basePrice: selectedProduct.price ?? 0,
              customPrice: selectedProduct.customPrice ?? null,
              vendor: selectedProduct.vendor,
            }
            : null
        }
        onSuccess={() => {
          refetch();
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
