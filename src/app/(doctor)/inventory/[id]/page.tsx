"use client";
import { ProductSwiper, ThemeButton, Loader } from "@/app/components";
import OrderModal from "@/app/components/ui/modals/OrderModal";
import { ArrowDownIcon, HeartFilledIcon, HeartOutlineIcon, ShopingCartIcon } from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { FETCH_PRODUCT } from "@/lib/graphql/queries";
import { CREATE_ORDER, TOGGLE_FAVOURITE } from "@/lib/graphql/mutations";
import { FetchProductResponse } from "@/types/products";
import { showErrorToast } from "@/lib/toast";

export default function PostDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  
  const [price, setPrice] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // GraphQL query to fetch product data
  const { data, loading, error, refetch } = useQuery<FetchProductResponse>(FETCH_PRODUCT, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
    fetchPolicy: "network-only",
  });

  // GraphQL mutation to create order
  const [createOrder, { loading: createOrderLoading, error: createOrderError }] = useMutation(CREATE_ORDER);

  // GraphQL mutation to toggle favorite
  const [toggleFavorite, { loading: toggleFavoriteLoading, error: toggleFavoriteError }] = useMutation(TOGGLE_FAVOURITE);

  const product = data?.fetchProduct;

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

  // Transform product images for ProductSwiper with better fallback logic
  const productViews = (() => {
    // First try to use the images array
    if (product?.images && product.images.length > 0) {
      return product.images
        .filter(image => image.src) // Only include images with valid src
        .map((image, index) => ({
          id: `image-${index}`,
          title: image.alt || product.title || "Product Image",
          imagePath: image.src,
          thumbnailPath: image.src,
        }));
    }
    
    // Fallback to primary image
    if (product?.primaryImage?.src) {
      return [
        {
          id: "primary",
          title: product.title || "Product Image",
          imagePath: product.primaryImage.src,
          thumbnailPath: product.primaryImage.src,
        },
      ];
    }
    
    // Final fallback to default image
    return [
      {
        id: "default",
        title: product?.title || "Product Image",
        imagePath: "/images/products/p1.png",
        thumbnailPath: "/images/products/p1.png",
      },
    ];
  })();

  const handleConfirmOrder = async (orderData: { 
    customer: string; 
    price: number; 
    productId?: string; 
    shopifyVariantId?: string; 
    customerId?: string 
  }) => {
    try {
      if (!product || !orderData.customerId) {
        showErrorToast("Missing required order information");
        return;
      }

      const variantId = orderData.shopifyVariantId || product.variants?.[0]?.shopifyVariantId;
      if (!variantId) {
        showErrorToast("Product variant information is missing");
        return;
      }

      const orderItems = [
        {
          productId: orderData.productId || product.id,
          variantId: variantId,
          quantity: 1,
          price: orderData.price,
        }
      ];

      await createOrder({
        variables: {
          orderItems,
          totalPrice: orderData.price,
          patientId: orderData.customerId,
        },
      });

      setIsOrderModalOpen(false);
      showSuccessToast("Order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
  };

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
            <p className="text-red-500 text-lg">Error loading product: {error.message}</p>
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

            <div className="bg-gray-50 flex items-center justify-between gap-2 backdrop-blur-sm border py-1 md:py-2 px-2 md:px-3 rounded-xl border-gray-100">
              <span className="block w-fit rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm">
                {product.productType || "Peptide"}
              </span>

              <span className="block text-primary text-xs md:text-sm font-semibold">
                Stock: {product.totalInventory || 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 md:gap-5">
            <div>
              <h2 className="text-gray-900 font-semibold text-xl md:text-3xl xl:text-4xl">
                {product.title}
              </h2>

              <span className="text-primary font-semibold text-sm md:text-lg xl:text-xl">
                ${product.variants?.[0]?.price || product.customPrice || "0.00"}
              </span>
            </div>

            {/* <div>
              <label
                htmlFor="input-group-1"
                className="block mb-1 text-sm font-normal text-gray-600"
              >
                Price to Customer ($)
              </label>
              <div className="relative flex items-center w-fit">
                <div className="absolute inset-y-0 text-gray-400 start-0 text-sm flex items-center ps-3.5 pointer-events-none">
                  $
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  maxLength={8}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`border border-gray-200 [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none  outline-none bg-white text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:ring-1 block w-full ps-8 pe-16 p-1.5 max-w-44`}
                  placeholder=""
                />
                <button className="rounded-md py-1.5 cursor-pointer text-primary font-semibold hover:bg-gray-300 px-3 absolute bg-porcelan text-xs  end-1">
                  Save
                </button>
              </div>
            
            </div> */}

            <div className="">
              <h2 className="text-black font-medium text-sm md:text-base ">
                Product Information
              </h2>

              <p className="text-gray-800 text-xs font-normal">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-4">
              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Manufacturer
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product.vendor || "PeptideLabs"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Dosage
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product.variants?.[0]?.price ? `${product.variants[0].price}mg vial` : "5mg vial"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Active Ingredient
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product.title.split(' ')[0] || "BPC-157 Acetate"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Category
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  {product.productType || "Healing Peptides"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-4">
              <div>
                <h2 className="text-xs md:text-sm text-gray-600 font-normal">
                  Current Stock:
                  <span className="text-primary ps-2 font-semibold">
                    {product.totalInventory || 0} units
                  </span>
                </h2>
              </div>

              <ThemeButton
                label="Order"
                icon={<ShopingCartIcon fill="white" height={20} width={20} />}
                onClick={() => setIsOrderModalOpen(true)}
                className="w-fit min-w-40"
                heightClass="h-11"
              />
            </div>

            <div className="bg-gray-50 rounded-xl">
              <div className="p-2 md:p-4 border-b border-b-gray-200">
                <h2 className="text-black font-medium text-sm md:text-base">
                  Details:
                </h2>
              </div>
              <div className="p-2 md:p-4">
               {product.description}
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrderModal
        isOpen={isOrderModalOpen}
        onConfirm={handleConfirmOrder}
        productId={product.id}
        shopifyVariantId={product.variants?.[0]?.shopifyVariantId}
        defaultPrice={product.variants?.[0]?.price || product.customPrice}
        isLoading={createOrderLoading}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}
