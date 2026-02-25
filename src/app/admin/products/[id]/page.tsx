"use client";
import {
  ProductSwiper,
  ThemeButton,
  Loader,
  EditProductModal,
} from "@/app/components";
import {
  ArrowDownIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  PencilEditIcon,
  PencilEditIcon2,
} from "@/icons";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { FETCH_PRODUCT } from "@/lib/graphql/queries";
import {
  TOGGLE_FAVOURITE,
  UPDATE_PRODUCT_PRICE,
} from "@/lib/graphql/mutations";
import { FetchProductResponse } from "@/types/products";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [price, setPrice] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  const [showEditModal, setEditModal] = useState(false);
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

  const product = data?.fetchProduct;

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
      showSuccessToast(
        product.isFavorited ? "Removed from favorites" : "Added to favorites",
      );
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

    // Prevent setting price lower than the original price
    if (priceValue < originalPrice) {
      showErrorToast(
        `Price cannot be less than the original price ($${originalPrice.toFixed(
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
      setIsEditingPrice(false);
      showSuccessToast("Price updated successfully!");
    } catch (error) {
      console.error("Error updating price:", error);
      showErrorToast("Failed to update price. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    if (product) {
      const currentPrice =
        product.customPrice || product.variants?.[0]?.price || 0;
      setPrice(currentPrice.toString());
      setPriceError("");
    }
    setIsEditingPrice(false);
  };

  // Transform product images for ProductSwiper
  const productViews = (() => {
    // Fallback to primary image
    if (product?.primaryImage) {
      return [
        {
          id: "primary",
          title: product.title || "Product Image",
          imagePath: product.primaryImage,
          thumbnailPath: product.primaryImage,
        },
      ];
    }

    // Fallback to primary image
    if (product?.primaryImage) {
      return [
        {
          id: "primary",
          title: product.title || "Product Image",
          imagePath: product.primaryImage,
          thumbnailPath: product.primaryImage,
        },
      ];
    }

    // Final fallback to default image
    return [
      {
        id: "default",
        title: product?.title || "Product Image",
        imagePath: "/images/products/placeholder.png",
        thumbnailPath: "/images/products/placeholder.png",
      },
    ];
  })();

  // Show loading state
  if (loading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => router.push("/admin/products")}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Product Details
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
            onClick={() => router.push("/admin/products")}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Product Details
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
            onClick={() => router.push("/admin/products")}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Product Details
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
          onClick={() => router.push("/admin/products")}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Product Details
        </h2>
      </div>
      <div className="bg-white shadow p-3 md:p-6 rounded-3xl">
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

              <span
                className={`inline-block whitespace-nowrap text-xs md:text-sm font-semibold ${
                  product.inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 md:gap-5">
            <div>
              <div className="flex items-center gap-3 justify-between">
                <h2 className="text-gray-900 font-semibold text-lg md:text-3xl xl:text-3xl">
                  {product.title}
                </h2>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditModal(true);
                  }}
                  className="border border-primary rounded-lg h-7 w-7 md:h-9 md:w-9 flex items-center justify-center "
                >
                  <PencilEditIcon2 />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-2">
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
                {product.variants?.[0]?.price && product.customPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    ${product.variants[0].price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div>
              {/* <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="product-price"
                  className="block text-base font-normal text-gray-600"
                >
                  Product Price ($)
                </label>
                {!isEditingPrice && (
                  <button
                    onClick={() => setIsEditingPrice(true)}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    <PencilEditIcon />
                    Edit
                  </button>
                )}
              </div> */}
              {isEditingPrice ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center w-full sm:w-fit">
                    <div className="absolute inset-y-0 text-gray-400 start-0 text-sm flex items-center ps-3.5 pointer-events-none">
                      $
                    </div>
                    <input
                      id="product-price"
                      type="number"
                      inputMode="numeric"
                      value={price}
                      maxLength={8}
                      onChange={(e) => {
                        const newPrice = e.target.value;
                        setPrice(newPrice);
                        setPriceError("");

                        // Validate in real-time
                        const priceValue = parseFloat(newPrice);
                        if (newPrice && !isNaN(priceValue)) {
                          const originalPrice =
                            product?.variants?.[0]?.price || 0;
                          if (priceValue < originalPrice) {
                            setPriceError(
                              `Minimum price: $${originalPrice.toFixed(2)}`,
                            );
                          }
                        }
                      }}
                      onBlur={() => {
                        // Clear error on blur if user leaves the field
                        const priceValue = parseFloat(price);
                        if (!price || isNaN(priceValue)) {
                          setPriceError("");
                        }
                      }}
                      className={`border ${
                        priceError
                          ? "border-red-500 focus:ring-red-200 focus:ring-1"
                          : "border-gray-200 focus:ring-gray-200 focus:ring-1"
                      } [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none outline-none bg-white text-gray-900 text-base rounded-lg block w-full sm:max-w-44 ps-8 pe-3 p-1.5`}
                      placeholder=""
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeButton
                      label={updatePriceLoading ? "Saving..." : "Save"}
                      onClick={handleSavePrice}
                      disabled={updatePriceLoading || !!priceError}
                      size="small"
                      className="whitespace-nowrap"
                    />
                    <button
                      onClick={handleCancelEdit}
                      disabled={updatePriceLoading}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-900 text-base font-medium">
                  $
                  {product?.customPrice ||
                    product?.variants?.[0]?.price ||
                    "0.00"}
                </div>
              )}
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
              <h2 className="text-black font-medium text-sm md:text-base mb-2">
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
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-4">
              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  Manufacturer
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.vendor || "N/A"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  Product Type
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.productType || "N/A"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  Stock Quantity
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.totalInventory || 0} units
                </span>
              </div>

              {/* <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-sm !font-normal">
                  SKU
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product?.variants?.[0]?.sku || "N/A"}
                </span>
              </div> */}
            </div>

            {product.productUnitPricings &&
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
                          const p =
                            tier.price != null
                              ? typeof tier.price === "number"
                                ? tier.price
                                : parseFloat(String(tier.price))
                              : NaN;
                          const isSelected = selectedUnitPricingIndex === index;
                          return (
                            <tr
                              key={tier.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setSelectedUnitPricingIndex(index);
                                if (!Number.isNaN(p)) setPrice(String(p));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedUnitPricingIndex(index);
                                  if (!Number.isNaN(p)) setPrice(String(p));
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
                                {!Number.isNaN(p)
                                  ? "$" + Number(p).toFixed(2)
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {product.variants && product.variants.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-2 md:p-4">
                <div className="space-y-2">
                  {/* Single price with priority: selected/first unit pricing → customPrice → variant price */}
                  {(() => {
                    const unitPricings = product.productUnitPricings;
                    const selectedTier =
                      unitPricings?.[selectedUnitPricingIndex] ??
                      unitPricings?.[0];
                    const prioritizedPrice =
                      selectedTier?.price != null
                        ? typeof selectedTier.price === "number"
                          ? selectedTier.price
                          : parseFloat(String(selectedTier.price))
                        : NaN;
                    const displayPrice = !Number.isNaN(prioritizedPrice)
                      ? prioritizedPrice
                      : product.customPrice ??
                        product.variants?.[0]?.price ??
                        0;
                    return (
                      <div className="bg-white rounded-lg p-2 md:p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>Price:</div>
                          <span className="text-xl font-semibold text-primary">
                            ${Number(displayPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl">
              <div className="p-2 md:p-4 border-b border-b-gray-200">
                <h2 className="text-black font-medium text-sm md:text-base">
                  Product Details:
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

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setEditModal(false)}
        product={product}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
