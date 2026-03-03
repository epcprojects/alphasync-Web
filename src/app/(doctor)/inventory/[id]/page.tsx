"use client";
import { ProductSwiper, ThemeButton, Loader } from "@/app/components";
import {
  ArrowDownIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  ShopingCartIcon,
} from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { FETCH_PRODUCT } from "@/lib/graphql/queries";
import {
  TOGGLE_FAVOURITE,
  UPDATE_PRODUCT_PRICE,
  MARK_PRODUCT_NOT_FOR_SALE,
} from "@/lib/graphql/mutations";
import { FetchProductResponse } from "@/types/products";
import { showErrorToast } from "@/lib/toast";
import { PHARMACY_VENDORS } from "@/lib/constants";

export default function PostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [price, setPrice] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");

  // GraphQL query to fetch product data
  const { data, loading, error, refetch } = useQuery<FetchProductResponse>(
    FETCH_PRODUCT,
    {
      variables: {
        id: params.id,
      },
      skip: !params.id,
      fetchPolicy: "network-only",
    },
  );

  // GraphQL mutation to toggle favorite
  const [toggleFavorite, { loading: toggleFavoriteLoading }] =
    useMutation(TOGGLE_FAVOURITE);

  // GraphQL mutation to update product price
  const [updateProductPrice, { loading: updatePriceLoading }] =
    useMutation(UPDATE_PRODUCT_PRICE);

  // GraphQL mutation to mark product not for sale (revert to base, remove from customer catalog)
  const [markProductNotForSale, { loading: removeFromSaleLoading }] =
    useMutation(MARK_PRODUCT_NOT_FOR_SALE);

  const product = data?.fetchProduct;

  const isPharmacyProduct =
    !!product?.vendor && PHARMACY_VENDORS.includes(product.vendor);

  // Selected unit pricing index (when productUnitPricings exists). Default first.
  const [selectedUnitPricingIndex, setSelectedUnitPricingIndex] = useState(0);

  // Initialize price when product data is loaded; default to first unit pricing if present
  useEffect(() => {
    if (product) {
      const unitPricings = product.productUnitPricings;
      if (unitPricings && unitPricings.length > 0) {
        setSelectedUnitPricingIndex(0);
        const first = unitPricings[0];
        const p =
          first.price != null
            ? typeof first.price === "number"
              ? first.price
              : parseFloat(String(first.price))
            : NaN;
        if (!Number.isNaN(p)) setPrice(String(p));
        else
          setPrice(
            String(product.customPrice || product.variants?.[0]?.price || 0),
          );
      } else {
        const currentPrice =
          product.customPrice || product.variants?.[0]?.price || 0;
        setPrice(currentPrice.toString());
      }
      setPriceError("");
    }
  }, [product]);

  const handleToggleFavorite = async () => {
    if (!product?.id) return;

    try {
      await toggleFavorite({
        variables: {
          productId: product.id,
        },
      });

      // Refetch the product to get updated favorite status
      await refetch();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      showErrorToast("Failed to update favorite status. Please try again.");
    }
  };

  const handleSavePrice = async () => {
    if (!product?.id) return;

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      showErrorToast("Please enter a valid price");
      return;
    }

    // Get the original price from the product variant
    const originalPrice = product.variants?.[0]?.price || 0;

    // Prevent setting price less than or equal to the original price
    if (priceValue <= originalPrice) {
      showErrorToast(
        `Price must be greater than the original price ($${originalPrice.toFixed(
          2,
        )})`,
      );
      return;
    }

    try {
      await updateProductPrice({
        variables: {
          productId: product.id,
          price: priceValue,
        },
      });

      // Refetch the product to get updated price
      await refetch();
      showSuccessToast("Price updated successfully!");
    } catch (error) {
      console.error("Error updating price:", error);
      showErrorToast("Failed to update price. Please try again.");
    }
  };

  const handleRemoveFromSale = async () => {
    if (!product?.id) return;

    try {
      await markProductNotForSale({
        variables: { productId: product.id },
      });
      await refetch();
      setPrice((product.variants?.[0]?.price || 0).toString());
      setPriceError("");
      showSuccessToast(
        "Product removed from sale. It’s back to base price and no longer available for customers to purchase.",
      );
    } catch (error) {
      console.error("Error removing product from sale:", error);
      showErrorToast("Failed to remove from sale. Please try again.");
    }
  };

  // Transform product images for ProductSwiper with better fallback logic
  const useRxPlaceholder =
    product?.vendor != null && product.vendor !== "Alpha BioMed";
  const defaultPlaceholder = useRxPlaceholder
    ? "/images/products/rx-placeholder.png"
    : "/images/products/placeholder.png";

  const productViews = (() => {
    // Fallback to primary image
    if (product?.primaryImage) {
      return [
        {
          id: "primary",
          title: product.title || "Product Image",
          imagePath: product.primaryImage,
          thumbnailPath: product.primaryImage,
          vendor: product.vendor,
        },
      ];
    }

    // Final fallback to default image
    return [
      {
        id: "default",
        title: product?.title || "Product Image",
        imagePath: defaultPlaceholder,
        thumbnailPath: defaultPlaceholder,
        vendor: product?.vendor,
      },
    ];
  })();

  // Show loading state
  if (loading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={router.back}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow-lg items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Back to Inventory
          </h2>
        </div>
        <div className="bg-white shadow p-3 md:p-6 rounded-3xl">
          <Loader />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={router.back}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow-lg items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Back to Inventory
          </h2>
        </div>
        <div className="bg-white shadow p-3 md:p-6 rounded-3xl">
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">
              Error loading product: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!product) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={router.back}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow-lg items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Back to Inventory
          </h2>
        </div>
        <div className="bg-white shadow p-3 md:p-6 rounded-3xl">
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={router.back}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow-lg items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Back to Inventory
        </h2>
      </div>
      <div className="bg-white shadow p-3 md:p-6 rounded-3xl ">
        <div className="grid grid-cols-1 lg:grid-cols-[410px_1fr] gap-4 md:gap-6">
          <div className="bg-white flex flex-col gap-4 h-fit shadow relative border border-gray-200 p-4 rounded-xl overflow-hidden">
            <button
              className="absolute top-4 end-4 z-10 cursor-pointer"
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteLoading}
            >
              {product.isFavorited ? (
                <HeartFilledIcon fill="#2862A9" />
              ) : (
                <HeartOutlineIcon fill="#374151" />
              )}
            </button>
            <ProductSwiper productViews={productViews} />

            <div className="bg-gray-50 flex items-start justify-between gap-2 backdrop-blur-sm border py-1 md:py-2 px-2 md:px-3 rounded-xl border-gray-100">
              <div className="flex items-center flex-wrap gap-2">
                {product.tags?.length && product.tags.length > 0
                  ? product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm"
                      >
                        {tag}
                      </span>
                    ))
                  : null}
              </div>

              {!isPharmacyProduct && (
                <span className="inline-block whitespace-nowrap text-primary text-xs md:text-sm font-semibold">
                  Stock: {product.totalInventory || 0}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2.5 md:gap-5">
            <div>
              <h2 className="text-gray-900 font-semibold text-lg md:text-3xl xl:text-3xl">
                {product.title}
              </h2>

              <span className="text-primary font-semibold text-sm md:text-lg xl:text-xl">
                $
                {product?.productUnitPricings &&
                product.productUnitPricings.length > 0 &&
                product.productUnitPricings[selectedUnitPricingIndex]
                  ? (() => {
                      const tier =
                        product.productUnitPricings[selectedUnitPricingIndex];
                      const p =
                        tier.price != null
                          ? typeof tier.price === "number"
                            ? tier.price
                            : parseFloat(String(tier.price))
                          : NaN;
                      return !Number.isNaN(p)
                        ? Number(p).toFixed(2)
                        : product?.customPrice ||
                            product?.variants?.[0]?.price ||
                            "0.00";
                    })()
                  : product?.customPrice ||
                    product?.variants?.[0]?.price ||
                    "0.00"}
              </span>
            </div>

            <div>
              <label
                htmlFor="input-group-1"
                className="block mb-1 text-base font-normal text-gray-600"
              >
                Price to Customer ($)
              </label>
              <div className="relative flex items-center w-full sm:w-fit">
                <div className="absolute inset-y-0 text-gray-400 start-0 text-sm flex items-center ps-3.5 pointer-events-none">
                  $
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  maxLength={8}
                  onChange={(e) => {
                    const newPrice = e.target.value;
                    setPrice(newPrice);

                    // Validate in real-time
                    const priceValue = parseFloat(newPrice);
                    if (!newPrice || newPrice.trim() === "") {
                      // If empty, clear error but button will still be disabled if price is required
                      setPriceError("");
                    } else if (isNaN(priceValue) || priceValue <= 0) {
                      setPriceError("Please enter a valid price");
                    } else {
                      const originalPrice = product?.variants?.[0]?.price || 0;
                      if (priceValue <= originalPrice) {
                        setPriceError(
                          `Price must be greater than original price ($${originalPrice.toFixed(
                            2,
                          )})`,
                        );
                      } else {
                        setPriceError("");
                      }
                    }
                  }}
                  onBlur={() => {
                    // Re-validate on blur
                    const priceValue = parseFloat(price);
                    if (!price || isNaN(priceValue)) {
                      setPriceError("");
                    } else {
                      const originalPrice = product?.variants?.[0]?.price || 0;
                      if (priceValue <= originalPrice) {
                        setPriceError(
                          `Price must be greater than original price ($${originalPrice.toFixed(
                            2,
                          )})`,
                        );
                      } else {
                        setPriceError("");
                      }
                    }
                  }}
                  className={`border ${
                    priceError
                      ? "border-red-500 focus:ring-red-200 focus:ring-1"
                      : "border-gray-200 focus:ring-gray-200 focus:ring-1"
                  } [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none  outline-none bg-white text-gray-900 text-base rounded-lg block w-full ps-8 pe-16 p-1.5 sm:max-w-44`}
                  placeholder=""
                />
                <button
                  onClick={handleSavePrice}
                  disabled={
                    isPharmacyProduct ||
                    updatePriceLoading ||
                    !!priceError ||
                    !price ||
                    isNaN(parseFloat(price)) ||
                    parseFloat(price) <= 0 ||
                    (product?.variants?.[0]?.price != null &&
                      parseFloat(price) <= product.variants[0].price)
                  }
                  className="rounded-md py-1.5 cursor-pointer text-primary font-semibold hover:bg-gray-300 px-3 absolute bg-porcelan text-xs end-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePriceLoading ? "Saving..." : "Save"}
                </button>
              </div>
              {priceError && (
                <p className="text-xs text-red-500 mt-1">{priceError}</p>
              )}
            </div>

            {product?.directions != null && product.directions !== "" && (
              <div className="">
                <h2 className="text-black font-medium text-sm md:text-base mb-2">
                  Directions
                </h2>
                <p
                  className="text-gray-800 text-sm sm:text-base font-normal"
                  dangerouslySetInnerHTML={{
                    __html: product.directions,
                  }}
                />
              </div>
            )}

            <div className="">
              <h2 className="text-black font-medium text-sm md:text-base ">
                Product Information
              </h2>

              <p
                className="text-gray-800 text-sm sm:text-base font-normal"
                dangerouslySetInnerHTML={{
                  __html: product.description || "No description available.",
                }}
              ></p>
            </div>

            {(product?.form || product?.strength || product?.bud) && (
              <div className="grid grid-cols-1 gap-2 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product?.form != null && product.form !== "" && (
                  <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                    <span className="block text-gray-800 text-sm !font-normal">
                      Form
                    </span>
                    <span className="text-gray-800 block font-xs md:text-sm font-medium">
                      {product.form}
                    </span>
                  </div>
                )}
                {product?.strength != null && product.strength !== "" && (
                  <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                    <span className="block text-gray-800 text-sm !font-normal">
                      Strength
                    </span>
                    <span className="text-gray-800 block font-xs md:text-sm font-medium">
                      {product.strength}
                    </span>
                  </div>
                )}
                {product?.bud != null && product.bud !== "" && (
                  <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                    <span className="block text-gray-800 text-sm !font-normal">
                      Best use within
                    </span>
                    <span className="text-gray-800 block font-xs md:text-sm font-medium">
                      {product.bud} days
                    </span>
                  </div>
                )}
                {product?.deaSchedule != null && product.vendor === "Integrity" && (
                  <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                    <span className="block text-gray-800 text-sm !font-normal">
                      DEA Schedule
                    </span>
                    <span className="text-gray-800 block font-xs md:text-sm font-medium">
                      {product.deaSchedule}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Price History and Markup Section */}
            {!isPharmacyProduct &&
              product.customPriceChangeHistory &&
              product.customPriceChangeHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200">
                  <h2 className="text-black font-medium text-sm md:text-base mb-3 md:mb-4">
                    Pricing Information
                  </h2>
                  <div className="flex flex-col gap-3 md:gap-4">
                    {product.markupPercentage !== undefined &&
                      product.markupPercentage !== null && (
                        <div className="bg-white rounded-lg p-2.5 md:p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm md:text-base font-normal">
                              Markup Percentage
                            </span>
                            <span className="text-primary font-semibold text-sm md:text-base">
                              {Number(product.markupPercentage || 0).toFixed(2)}
                              %
                            </span>
                          </div>
                        </div>
                      )}

                    <div className="bg-white rounded-lg p-2.5 md:p-3 border border-gray-200">
                      <h3 className="text-gray-700 font-medium text-xs md:text-sm mb-2 md:mb-3">
                        Price History
                      </h3>
                      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-md border border-gray-100">
                          <span className="text-gray-600 text-xs md:text-sm">
                            Base Price
                          </span>
                          <span className="text-gray-800 font-semibold text-xs md:text-sm">
                            $
                            {(
                              product?.price ||
                              product?.variants?.[0]?.price ||
                              0
                            ).toFixed(2)}
                          </span>
                        </div>
                        {product.customPriceChangeHistory.map(
                          (history, index) => {
                            const priceValue =
                              history.customPrice !== null &&
                              history.customPrice !== undefined
                                ? Number(history.customPrice)
                                : 0;

                            // Format date if available
                            const formatDate = (dateString?: string) => {
                              if (!dateString) return "";
                              try {
                                const date = new Date(dateString);
                                return date.toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                });
                              } catch {
                                return "";
                              }
                            };

                            return (
                              <div
                                key={history.id || index}
                                className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-md border border-gray-100"
                              >
                                <div className="flex flex-col">
                                  <span className="text-gray-600 text-xs md:text-sm">
                                    Marked Up Price #{index + 1}
                                  </span>
                                  {history.createdAt && (
                                    <span className="text-gray-500 text-xs mt-0.5">
                                      {formatDate(history.createdAt)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-gray-800 font-semibold text-xs md:text-sm">
                                  ${priceValue.toFixed(2)}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-4">
              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  {isPharmacyProduct ? "Unit Type" : "Manufacturer"}
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.vendor ?? "N/A"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  Product Type
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.productType ?? "N/A"}
                </span>
              </div>

              {!isPharmacyProduct && (
                <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                  <span className="block text-gray-800 text-sm !font-normal">
                    Stock Quantity
                  </span>
                  <span className="text-gray-800 block font-xs md:text-sm font-medium">
                    {product?.totalInventory ?? 0} units
                  </span>
                </div>
              )}

              {/* <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  SKU
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.variants?.[0]?.sku ?? "N/A"}
                </span>
              </div> */}

              {/* {product?.tags && product.tags.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                  <span className="block text-gray-800 text-sm !font-normal">
                    Category
                  </span>
                  <span className="text-gray-800 block font-xs md:text-sm font-medium">
                    {product?.category ?? "—"}
                  </span>
                </div>
              )} */}
            </div>

            {/* Pricing per unit - just above Order button */}
            {isPharmacyProduct &&
              product.productUnitPricings &&
              product.productUnitPricings.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-200">
                  <h2 className="text-black font-medium text-sm md:text-base mb-3 md:mb-4">
                    Pricing per unit
                  </h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="py-2.5 px-3 font-medium text-gray-700 w-8">
                            {" "}
                          </th>
                          <th className="py-2.5 px-3 font-medium text-gray-700">
                            Quantity
                          </th>
                          <th className="py-2.5 px-3 font-medium text-gray-700">
                            Strength
                          </th>
                          <th className="py-2.5 px-3 font-medium text-gray-700">
                            Price per unit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.productUnitPricings.map((tier, index) => {
                          const priceValue =
                            tier.price != null
                              ? typeof tier.price === "number"
                                ? tier.price
                                : parseFloat(String(tier.price))
                              : NaN;
                          const displayPrice = !Number.isNaN(priceValue)
                            ? `$${Number(priceValue).toFixed(2)}`
                            : "—";
                          const isSelected = selectedUnitPricingIndex === index;
                          return (
                            <tr
                              key={tier.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setSelectedUnitPricingIndex(index);
                                if (!Number.isNaN(priceValue))
                                  setPrice(String(priceValue));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedUnitPricingIndex(index);
                                  if (!Number.isNaN(priceValue))
                                    setPrice(String(priceValue));
                                }
                              }}
                              className="border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50"
                            >
                              <td className="py-2 px-3 text-gray-800 w-8">
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
                              <td className="py-2 px-3 font-semibold text-gray-900">
                                {displayPrice}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 md:gap-4">
              {!isPharmacyProduct && (
                <div>
                  <h2 className="text-sm text-gray-600 font-normal">
                    Current Stock:
                    <span className="text-primary ps-2 font-semibold">
                      {product.totalInventory || 0} units
                    </span>
                  </h2>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {product.customPrice != null &&
                  product.customPrice !== undefined && (
                    <ThemeButton
                      onClick={handleRemoveFromSale}
                      variant="outline"
                      className="flex-1"
                      heightClass="h-10 md:h-11"
                      disabled={removeFromSaleLoading}
                      label={
                        removeFromSaleLoading ? "Removing…" : "Remove from Sale"
                      }
                    />
                  )}
                <ThemeButton
                  label="Order"
                  icon={<ShopingCartIcon fill="white" height={20} width={20} />}
                  onClick={() =>
                    router.push(`/orders/new-order?productId=${product.id}`)
                  }
                  className="w-full sm:w-fit sm:min-w-40"
                  heightClass="h-11"
                  disabled={
                    product.customPrice === null ||
                    product.customPrice === undefined ||
                    (product?.vendor !== "Alpha BioMed" &&
                      product?.vendor !== "City Center")
                  }
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl">
              <div className="p-2 md:p-4 border-b border-b-gray-200">
                <h2 className="text-black font-medium text-sm md:text-base">
                  Details:
                </h2>
              </div>
              <div
                className="p-2 md:p-4 text-sm sm:text-base"
                dangerouslySetInnerHTML={{
                  __html: product.description || "No description available.",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
