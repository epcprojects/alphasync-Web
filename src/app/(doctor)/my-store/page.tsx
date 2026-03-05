"use client";

import { Pagination, ShopProductCard, Skeleton, ThemeButton } from "@/app/components";
import AppModal from "@/app/components/ui/modals/AppModal";
import { useMutation, useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  DeliveryBoxIcon,
  PlusIcon,
  SearchIcon,
  ShoppingCartRemoveIcon,
} from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";
import { useAppDispatch } from "@/lib/store/hooks";
import { addItem } from "@/lib/store/slices/cartSlice";
import {
  ADD_TO_CART,
  MARK_ALL_PRODUCTS_NOT_FOR_SALE,
  MARK_PRODUCT_NOT_FOR_SALE,
} from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const dispatch = useAppDispatch();
  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    onError: (e) => {
      showErrorToast(e.message || "Failed to add to cart");
    },
  });
  const [markProductNotForSale] = useMutation(MARK_PRODUCT_NOT_FOR_SALE, {
    onError: (e) => {
      showErrorToast(e.message || "Failed to remove from your store");
    },
  });
  const [markAllProductsNotForSale, { loading: removingAll }] = useMutation(
    MARK_ALL_PRODUCTS_NOT_FOR_SALE,
    {
      onCompleted: () => {
        showSuccessToast("All products removed from your store");
        refetch();
      },
      onError: (e) => {
        showErrorToast(e.message || "Failed to remove all products");
      },
    }
  );

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [removingProductIds, setRemovingProductIds] = useState<Record<string, boolean>>({});
  const [isRemoveAllConfirmOpen, setIsRemoveAllConfirmOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState<{ id: string; title: string } | null>(null);

  /** When set, show modal to select unit pricing before adding to cart (products with productUnitPricings). */
  const [unitPricingModal, setUnitPricingModal] = useState<{
    productId: string;
    name: string;
    imageSrc: string;
    qty: number;
    productUnitPricings: Array<{
      id: string;
      price?: unknown;
      quantity: number;
      strength?: string | null;
    }>;
  } | null>(null);
  const [selectedUnitPricingIndex, setSelectedUnitPricingIndex] = useState(0);

  const itemsPerPage = 9;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery<AllProductsResponse>(
    ALL_PRODUCTS_INVENTORY,
    {
      variables: {
        search: debouncedSearch || null,
        page: currentPage,
        perPage: itemsPerPage,
        markedUp: true,
      },
      fetchPolicy: "network-only",
    }
  );

  const pageCount = data?.allProducts?.totalPages || 1;

  const shopProducts = useMemo(() => {
    const allData = data?.allProducts?.allData ?? [];
    return allData.map((p, idx) => {
      const firstVariant = p.variants?.[0];
      const customerPrice =
        p.customPrice != null && p.customPrice !== undefined
          ? p.customPrice
          : firstVariant?.price ?? 0;

      const basePrice = (() => {
        const priceRangeStr = (p.priceRange || "").trim();
        if (priceRangeStr.startsWith("$")) {
          return priceRangeStr.split(" - ")[0] || priceRangeStr;
        }
        const match = priceRangeStr.match(/[\d.]+/);
        if (match) {
          const n = Number(match[0]);
          if (!Number.isNaN(n)) return `$${n.toFixed(2)}`;
        }
        if (firstVariant?.price != null) return `$${Number(firstVariant.price).toFixed(2)}`;
        return undefined;
      })();

      return {
        id: Number(p.id) || idx + 1,
        originalId: p.id,
        title: p.title,
        description: p.description || "",
        category: p.productType || (p.tags?.[0] ?? "N/A"),
        stock: p.totalInventory ?? 0,
        price: `$${Number(customerPrice).toFixed(2)}`,
        basePrice,
        vendor: p.vendor,
        image:
          (typeof p.primaryImage === "string" &&
          p.primaryImage.trim().length > 0
            ? p.primaryImage
            : p.images?.find(
                (img) => typeof img === "string" && img.trim().length > 0,
              )) || "",
        isFavourite: !!p.isFavorited,
        productUnitPricings: p.productUnitPricings,
      };
    });
  }, [data]);

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
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

  const handleRemoveFromShop = async (productId: string) => {
    if (removingProductIds[productId]) return;
    setRemovingProductIds((prev) => ({ ...prev, [productId]: true }));
    try {
      await markProductNotForSale({ variables: { productId } });
      // Product will no longer match markedUp:true after this, so refresh list
      await refetch();
    } finally {
      setRemovingProductIds((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  };

  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
          Failed to load my store products. Please try again.
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
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              My Store
            </h2>
            <p className="text-sm sm:text-base">
              These are the items your customers see. They won’t see your clinic
              price.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2 lg:gap-3">
          {shopProducts.length > 0 && (
            <ThemeButton
              label={removingAll ? "Removing..." : "Remove All Products"}
              onClick={() => setIsRemoveAllConfirmOpen(true)}
              disabled={removingAll}
              variant="outline"
              className="shrink-0"
            />
          )}
          <ThemeButton
            label="Add Items to My Store"
            icon={<PlusIcon />}
            onClick={() => router.push("/inventory")}
            className="shrink-0"
          />
          <div className="sm:bg-white rounded-full flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
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
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <Skeleton className="w-full h-48 rounded-lg mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : shopProducts.length === 0 ? (
        <div className="h-full bg-white py-20 flex flex-col justify-center items-center gap-7 text-center rounded-xl">
          <ShoppingCartRemoveIcon />
          <div className="space-y-3">
            <h2 className="font-semibold text-2xl text-gray-900">
                Your Store is empty.
            </h2>

              <p className="font-medium text-lg text-gray-800">
                Head to{" "}
                <Link
                  className="text-primary hover:underline underline-offset-2"
                  href="/inventory"
                >
                  Inventory
                </Link>
                , mark up an item, and start selling.
              </p>
            </div>
            <ThemeButton
              label="Add Products"
              icon={<PlusIcon />}
              onClick={() => router.push("/inventory")}
            />
          </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
            {shopProducts.map((product) => (
              <ShopProductCard
                key={product.originalId || product.id}
                product={product}
                onRemoveFromShop={() =>
                  setProductToRemove({
                    id: product.originalId || String(product.id),
                    title: product.title,
                  })
                }
                removingFromShop={!!removingProductIds[product.originalId || String(product.id)]}
                onAddToCart={(payload) => {
                  const product = shopProducts.find(
                    (p) => (p.originalId || String(p.id)) === payload.productId
                  );
                  const unitPricings = (product as { productUnitPricings?: Array<{ id: string; price?: unknown; quantity: number; strength?: string | null }> } | undefined)
                    ?.productUnitPricings;
                  if (unitPricings && unitPricings.length > 0) {
                    setUnitPricingModal({
                      productId: payload.productId,
                      name: payload.name,
                      imageSrc: payload.imageSrc,
                      qty: payload.qty,
                      productUnitPricings: unitPricings,
                    });
                    setSelectedUnitPricingIndex(0);
                    return;
                  }
                  dispatch(
                    addItem({
                      id: payload.productId,
                      name: payload.name,
                      price: payload.price,
                      qty: payload.qty,
                      imageSrc: payload.imageSrc,
                    })
                  );
                  addToCartMutation({
                    variables: {
                      productId: payload.productId,
                      quantity: payload.qty,
                    },
                  });
                  showSuccessToast("Item added to cart");
                }}
                onCardClick={() => {
                  router.push(`/inventory/${product.originalId}`);
                }}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <Pagination
              currentPage={currentPage - 1} // Convert 1-based to 0-based
              totalPages={pageCount}
              onPageChange={(selectedPage) => handlePageChange(selectedPage + 1)}
            />
          )}
        </>
      )}

      <AppModal
        isOpen={isRemoveAllConfirmOpen}
        onClose={() => {
          if (!removingAll) setIsRemoveAllConfirmOpen(false);
        }}
        title="Remove all products?"
        subtitle=""
        onConfirm={() => {
          markAllProductsNotForSale({ variables: { clientMutationId: null } });
          setIsRemoveAllConfirmOpen(false);
        }}
        confirmLabel={removingAll ? "Removing..." : "Remove all"}
        cancelLabel="Cancel"
        confirmBtnVarient="danger"
        confimBtnDisable={removingAll}
        disableCloseButton={removingAll}
        outSideClickClose={!removingAll}
        bodyPaddingClasses="p-4 md:p-6"
      >
        <p className="text-sm md:text-base text-gray-700">
          Remove all products from your store? Customers will no longer see any
          of these items.
        </p>
      </AppModal>

      <AppModal
        isOpen={!!unitPricingModal}
        onClose={() => setUnitPricingModal(null)}
        title="Select unit pricing"
        subtitle=""
        onConfirm={() => {
          if (!unitPricingModal) return;
          const tier = unitPricingModal.productUnitPricings[selectedUnitPricingIndex];
          if (!tier) return;
          const unitPrice = parseUnitPrice(tier.price);
          dispatch(
            addItem({
              id: `${unitPricingModal.productId}__${tier.id}`,
              productId: unitPricingModal.productId,
              name: unitPricingModal.name,
              price: unitPrice,
              qty: unitPricingModal.qty,
              imageSrc: unitPricingModal.imageSrc,
              productUnitPricingId: tier.id,
            })
          );
          addToCartMutation({
            variables: {
              productId: unitPricingModal.productId,
              quantity: unitPricingModal.qty,
              productUnitPricingId: tier.id,
            },
          });
          showSuccessToast("Item added to cart");
          setUnitPricingModal(null);
        }}
        confirmLabel="Add to Cart"
        cancelLabel="Cancel"
        confirmBtnVarient="filled"
        bodyPaddingClasses="p-4 md:p-6"
      >
        {unitPricingModal && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Choose a unit pricing for &quot;{unitPricingModal.name}&quot; (qty: {unitPricingModal.qty})
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-2 px-3 w-8 font-medium text-gray-600" aria-hidden="true" />
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Quantity</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-600">Strength</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-600">Price per unit</th>
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
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-block h-5 w-5" />
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-800">{tier.quantity}</td>
                        <td className="py-2 px-3 text-gray-800">{tier.strength ?? "—"}</td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-900">${price.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AppModal>

      <AppModal
        isOpen={!!productToRemove}
        onClose={() => {
          if (!removingProductIds[productToRemove?.id ?? ""]) setProductToRemove(null);
        }}
        title="Remove from store?"
        subtitle=""
        onConfirm={async () => {
          if (!productToRemove) return;
          await handleRemoveFromShop(productToRemove.id);
          setProductToRemove(null);
        }}
        confirmLabel={removingProductIds[productToRemove?.id ?? ""] ? "Removing..." : "Remove"}
        cancelLabel="Cancel"
        confirmBtnVarient="danger"
        confimBtnDisable={!!removingProductIds[productToRemove?.id ?? ""]}
        disableCloseButton={!!removingProductIds[productToRemove?.id ?? ""]}
        outSideClickClose={!removingProductIds[productToRemove?.id ?? ""]}
        bodyPaddingClasses="p-4 md:p-6"
      >
        <p className="text-sm md:text-base text-gray-700">
          Remove &quot;{productToRemove?.title ?? ""}&quot; from your store? Customers will no
          longer see this item.
        </p>
      </AppModal>
    </div>
  );
};

export default Page;
