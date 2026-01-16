"use client";
import React, { useState } from "react";
import { AppModal, CustomerSelect } from "@/components";
import { useLazyQuery } from "@apollo/client";
import { FETCH_PRODUCT } from "@/lib/graphql/queries";
import { FetchProductResponse } from "@/types/products";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    customer: string;
    price: number;
    productId?: string;
    shopifyVariantId?: string;
    customerId?: string;
    useCustomPricing?: boolean;
  }) => void;
  productId?: string;
  shopifyVariantId?: string;
  customPrice?: number;
  price?: number;
  isLoading?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productId,
  shopifyVariantId,
  customPrice,
  price: originalPrice,
  isLoading = false,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<{ user?: string; price?: string }>({});
  const [selectedCustomerData, setSelectedCustomerData] = useState<{
    name: string;
    displayName: string;
    email: string;
    id: string;
  } | null>(null);
  const [basePrice, setBasePrice] = useState<number>(0); // Price that was automatically set (initial or from customer fetch)
  const [isPriceManuallyChanged, setIsPriceManuallyChanged] =
    useState<boolean>(false);

  // Lazy query to fetch product with customer-specific pricing
  // This query ONLY runs when a customer is selected, not automatically
  // Using "no-cache" to prevent updating the shared cache that affects inventory page
  const [fetchProduct, { loading: fetchingProduct }] =
    useLazyQuery<FetchProductResponse>(FETCH_PRODUCT, {
      fetchPolicy: "no-cache", // Don't read from or write to cache - only update modal state
      notifyOnNetworkStatusChange: false, // Prevent triggering other queries
      onCompleted: (data) => {
        if (data?.fetchProduct) {
          const product = data.fetchProduct;
          // If customPrice is present, use it; otherwise use price field
          const customerPrice =
            product.customPrice != null && product.customPrice !== undefined
              ? product.customPrice
              : product.price != null
              ? product.price
              : originalPrice || 0;

          if (customerPrice > 0) {
            setPrice(customerPrice.toString());
            // Update base price to the customer-specific price
            setBasePrice(customerPrice);
            // Reset manual change flag since this is an automatic update
            setIsPriceManuallyChanged(false);
          }
        }
      },
      onError: (error) => {
        console.error("Error fetching product with customer pricing:", error);
      },
    });

  // Calculate the correct price to display: customPrice if set (not null/undefined), otherwise originalPrice
  const calculatedPrice = React.useMemo(() => {
    return customPrice != null
      ? customPrice
      : originalPrice != null
      ? originalPrice
      : 0;
  }, [customPrice, originalPrice]);

  // Reset and populate price when modal opens or product changes
  React.useEffect(() => {
    if (isOpen) {
      // Always reset price when modal opens with the calculated price
      const priceToSet = calculatedPrice > 0 ? calculatedPrice.toString() : "";
      setPrice(priceToSet);
      // Store the base price (initial price when modal opens)
      setBasePrice(calculatedPrice);
      // Reset manual change flag
      setIsPriceManuallyChanged(false);
      // Reset other form fields when modal opens
      setSelectedUser("");
      setErrors({});
      setSelectedCustomerData(null);
    }
  }, [isOpen, calculatedPrice, productId]);

  const handleClose = () => {
    setSelectedUser("");
    setPrice("");
    setErrors({});
    setSelectedCustomerData(null);
    onClose();
  };

  // Reset price when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setPrice("");
      setSelectedUser("");
      setErrors({});
      setSelectedCustomerData(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const newErrors: { user?: string; price?: string } = {};

    if (!selectedUser) {
      newErrors.user = "Please select a customer.";
    }

    if (!price) {
      newErrors.price = "Please enter a price.";
    } else {
      const priceValue = Number(price);
      if (priceValue <= 0) {
        newErrors.price = "Price must be greater than 0.";
      } else if (originalPrice != null && priceValue < originalPrice) {
        // Original price is variants[0].price
        newErrors.price = `You cannot put price less than original price ($${originalPrice.toFixed(
          2
        )})`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const currentPrice = Number(price);
      // useCustomPricing is true only if user manually changed the price
      // (not if it was automatically updated from customer selection)
      const useCustomPricing = isPriceManuallyChanged;

      onConfirm({
        customer: selectedUser,
        price: currentPrice,
        productId,
        shopifyVariantId,
        customerId: selectedCustomerData?.id,
        useCustomPricing: useCustomPricing,
      });
      // Don't close modal here - let the parent handle it after successful mutation
    }
  };

  if (!isOpen) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Order"
      onConfirm={handleConfirm}
      outSideClickClose={false}
      confirmLabel={isLoading ? "Creating Order..." : "Create Order"}
      confimBtnDisable={
        !selectedUser ||
        !price ||
        Number(price) <= 0 ||
        (originalPrice != null && Number(price) < originalPrice) ||
        isLoading ||
        fetchingProduct
      }
      scrollNeeded={false}
    >
      <div className="w-full flex flex-col justify-between  md:min-h-20 gap-4">
        {/* Customer Selection */}
        <div>
          <CustomerSelect
            selectedCustomer={selectedUser}
            setSelectedCustomer={(customer) => {
              setErrors({});
              setSelectedUser(customer);
            }}
            errors={errors.user || ""}
            touched={!!errors.user}
            placeholder="Select Customer"
            required={true}
            showLabel={true}
            paddingClasses="py-1 px-2"
            optionPaddingClasses="p-1"
            onCustomerChange={(customer) => {
              setSelectedCustomerData(customer);

              // Fetch product with customer-specific pricing when customer is selected
              // if (customer?.id && productId) {
              //   fetchProduct({
              //     variables: {
              //       id: productId,
              //       patientId: customer.id,
              //     },
              //   });
              // }
            }}
          />
          {errors.user && (
            <p className="text-red-500 text-xs mt-1">{errors.user}</p>
          )}
        </div>

        {/* Price Input */}
        <div>
          <label
            htmlFor="input-group-1"
            className="block mb-1 text-sm font-medium text-gray-900"
          >
            Price to Customer ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 text-gray-400 start-0 flex items-center ps-3.5 pointer-events-none">
              $
            </div>
            <input
              type="number"
              id="input-group-1"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => {
                const newPrice = e.target.value;
                setPrice(newPrice);

                // Check if user manually changed the price from the base price
                const priceValue = Number(newPrice);
                if (newPrice && !isNaN(priceValue)) {
                  // Compare with base price (rounded to 2 decimals) to detect manual changes
                  const isChanged =
                    Math.round(priceValue * 100) !==
                    Math.round(basePrice * 100);
                  setIsPriceManuallyChanged(isChanged);

                  // Validate price in real-time
                  if (priceValue <= 0) {
                    setErrors((prev) => ({
                      ...prev,
                      price: "Price must be greater than 0.",
                    }));
                  } else if (
                    originalPrice != null &&
                    priceValue < originalPrice
                  ) {
                    setErrors((prev) => ({
                      ...prev,
                      price: `You cannot put price less than original price ($${originalPrice.toFixed(
                        2
                      )})`,
                    }));
                  } else {
                    // Clear price error if valid
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.price;
                      return newErrors;
                    });
                  }
                } else if (!newPrice) {
                  // Clear error if field is empty
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.price;
                    return newErrors;
                  });
                  // Reset manual change flag if field is empty
                  setIsPriceManuallyChanged(false);
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className={`border ${
                errors.price ? "border-red-500" : "border-gray-200"
              } outline-none bg-white text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:ring-1 block w-full ps-8 p-2.5`}
              placeholder=""
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default OrderModal;
