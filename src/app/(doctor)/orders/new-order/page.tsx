"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { ArrowDownIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { ProductSelect, CustomerSelect } from "@/app/components";
import { ThemeInput, ThemeButton } from "@/app/components";
import { Formik, Form, Field } from "formik";
import { Switch } from "@headlessui/react";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { formatNumber } from "@/lib/helpers";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import { FETCH_PRODUCT, FETCH_TIER_PRICING } from "@/lib/graphql/queries";
import type { ProductSelectRef } from "@/app/components/ui/inputs/ProductSelect";
import { FetchProductResponse } from "@/types/products";

interface OrderItem {
  product: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  customPrice?: number;
  initialPrice: number; // Track the initial price when item was added
  hasTierPricing?: boolean; // Track if product has tiered pricing
  latestMarkedUpPrice?: number | null; // Store latest marked up price for validation
}

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("productId");
  
  const [selectedProductData, setSelectedProductData] = useState<{
    name: string;
    displayName: string;
    productId?: string;
    variantId?: string;
    price?: number;
    customPrice?: number;
    originalPrice?: number;
    customPriceChangeHistory?: Array<{
      customPrice: number;
      id: string;
      createdAt?: string;
    }>;
    tierPricing?: Array<{
      endCount: number | null;
      startCount: number;
      tieredPrice: number;
      id: string;
    }>;
    variants?: Array<{
      id?: string;
      shopifyVariantId?: string;
      price?: number;
      sku?: string;
    }>;
  } | null>(null);
  const [productBasePrice, setProductBasePrice] = useState<number | null>(null);
  const [latestMarkedUpPrice, setLatestMarkedUpPrice] = useState<number | null>(
    null
  );
  const [isClinicOrder, setIsClinicOrder] = useState(false);

  // Make OrderSchema dynamic to access latestMarkedUpPrice and isClinicOrder
  const OrderSchema = useMemo(() => {
    return Yup.object().shape({
      customer: isClinicOrder
        ? Yup.string()
        : Yup.string().required("Customer is required"),
      product: Yup.string().required("Product is required"),
      quantity: Yup.number()
        .min(1, "Minimum 1")
        .positive("Quantity must be positive")
        .required("Quantity is required"),
      price: isClinicOrder
        ? Yup.number()
            .min(0.01, "Must be greater than 0")
            .required("Price is required")
        : Yup.number()
            .min(0.01, "Must be greater than 0")
            .required("Price is required")
            .test("greater-than-original", function (value) {
              if (!value || !selectedProductData) return true;
              // Original price is variants[0].price
              const originalPrice = selectedProductData.variants?.[0]?.price ?? 0;
              if (value < originalPrice) {
                return this.createError({
                  message: `Price must be greater than or equal to original price ($${originalPrice.toFixed(
                    2
                  )})`,
                });
              }
              return true;
            })
            .test("less-than-latest-markup", function (value) {
              if (!value || latestMarkedUpPrice === null) return true;
              if (value > latestMarkedUpPrice) {
                return this.createError({
                  message: `Price cannot exceed the latest marked up price ($${latestMarkedUpPrice.toFixed(
                    2
                  )})`,
                });
              }
              return true;
            }),
    });
  }, [selectedProductData, latestMarkedUpPrice, isClinicOrder]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerDraft, setCustomerDraft] = useState("");
  const [lockedCustomer, setLockedCustomer] = useState<string | null>(null);
  const [preservedProduct, setPreservedProduct] = useState("");
  const [preservedPrice, setPreservedPrice] = useState<number>(0);
  const [priceErrors, setPriceErrors] = useState<{ [index: number]: string }>(
    {}
  );
  const [selectedCustomerData, setSelectedCustomerData] = useState<{
    name: string;
    displayName: string;
    email: string;
    id: string;
  } | null>(null);

  // Ref to ProductSelect to trigger refetch
  const productSelectRef = useRef<ProductSelectRef>(null);
  
  // Ref to store Formik's setFieldValue function
  const formikSetFieldValueRef = useRef<((field: string, value: string | number) => void) | null>(null);

  // GraphQL mutation to create order
  const [
    createOrder,
    { loading: createOrderLoading, error: createOrderError },
  ] = useMutation(CREATE_ORDER);

  // Fetch product by ID from URL
  const { data: fetchedProductData } = useQuery<FetchProductResponse>(
    FETCH_PRODUCT,
    {
      variables: { id: productIdFromUrl },
      skip: !productIdFromUrl,
      fetchPolicy: "network-only",
    }
  );

  // Lazy query for tier pricing with debouncing
  const [fetchTierPricing, { data: tierPricingData }] = useLazyQuery(FETCH_TIER_PRICING, {
    fetchPolicy: "network-only",
  });

  // Debounced quantity for tier pricing API call
  const [debouncedQuantity, setDebouncedQuantity] = useState<number | null>(null);

  // Prefill product when fetched from URL
  useEffect(() => {
    if (fetchedProductData?.fetchProduct && productIdFromUrl) {
      const product = fetchedProductData.fetchProduct;
      const firstVariant = product.variants?.[0];
      const originalPrice = firstVariant?.price;
      const price = product.customPrice ?? originalPrice;
      
      // Check if product is marked up
      const isMarkedUp = (product.customPriceChangeHistory?.length ?? 0) > 0;
      
      // For non-clinic orders, only marked-up products are allowed
      // If product is not marked up and it's not a clinic order, switch to clinic order mode
      if (!isClinicOrder && !isMarkedUp) {
        setIsClinicOrder(true);
      }
      
      // Transform to ProductDropdownItem format
      const productDropdownItem = {
        name: product.title,
        displayName: product.title,
        productId: product.id,
        variantId: firstVariant?.shopifyVariantId,
        price: price,
        customPrice: product.customPrice,
        originalPrice: originalPrice,
        customPriceChangeHistory: product.customPriceChangeHistory,
        tierPricing: product.tierPricing,
        variants: product.variants?.map((variant) => ({
          id: variant.id,
          shopifyVariantId: variant.shopifyVariantId,
          price: variant.price,
          sku: variant.sku,
        })),
      };

      // Set the product data
      setSelectedProductData(productDropdownItem);
      
      // Update pricing info
      updatePricingInfo(productDropdownItem);
      
      // Set preserved product name for form
      setPreservedProduct(product.title);
      
      // Calculate price to use (clinic: base price, non-clinic: latest marked up price)
      const basePrice = originalPrice ?? 0;
      let latestMarkedUp: number | null = null;
      const ph = product.customPriceChangeHistory;
      if (ph?.length) {
        const sorted = [...ph].sort(
          (a, b) =>
            (new Date(b.createdAt ?? 0).getTime()) -
            (new Date(a.createdAt ?? 0).getTime())
        );
        if (sorted[0]?.customPrice != null)
          latestMarkedUp = Number(sorted[0].customPrice);
      }
      const latestMarkedUpValue =
        latestMarkedUp ??
        product.customPrice ??
        originalPrice ??
        0;
      // Use clinic order mode if product is not marked up, otherwise respect current mode
      const shouldUseClinicOrder = !isMarkedUp || isClinicOrder;
      const priceToUse = shouldUseClinicOrder ? basePrice : latestMarkedUpValue;
      setPreservedPrice(priceToUse);
      
      // Update form field values if form is available
      if (formikSetFieldValueRef.current) {
        formikSetFieldValueRef.current("product", product.title);
        formikSetFieldValueRef.current("price", priceToUse);
      }
      
      // Remove productId from URL after prefilling
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("productId");
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedProductData, productIdFromUrl, searchParams, router]);

  // Extract pricing information from selected product data
  const updatePricingInfo = (product: typeof selectedProductData) => {
    if (!product) {
      setProductBasePrice(null);
      setLatestMarkedUpPrice(null);
      return;
    }

    // Set base price (original price before markup)
    const basePriceValue = product.variants?.[0]?.price ?? 0;
    setProductBasePrice(basePriceValue);

    // Get latest marked up price from history (most recent entry)
    const priceHistory = product.customPriceChangeHistory;
    if (priceHistory && priceHistory.length > 0) {
      // Sort by createdAt descending to get the latest
      const sortedHistory = [...priceHistory].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      const latestHistory = sortedHistory[0];
      if (latestHistory?.customPrice != null) {
        setLatestMarkedUpPrice(Number(latestHistory.customPrice));
      } else {
        setLatestMarkedUpPrice(null);
      }
    } else {
      setLatestMarkedUpPrice(null);
    }
  };

  // Calculate tiered price based on quantity (fallback method)
  const getTieredPrice = (quantity: number): number | null => {
    if (!selectedProductData?.tierPricing || selectedProductData.tierPricing.length === 0) {
      return null;
    }

    // Find the tier that matches the quantity
    for (const tier of selectedProductData.tierPricing) {
      const startCount = tier.startCount;
      const endCount = tier.endCount;

      if (quantity >= startCount && (endCount === null || quantity <= endCount)) {
        return tier.tieredPrice;
      }
    }

    // If no tier matches, return null (shouldn't happen if tiers are properly configured)
    return null;
  };

  // Debounce quantity changes for tier pricing API call
  useEffect(() => {
    if (debouncedQuantity === null) return;

    const timer = setTimeout(() => {
      if (
        isClinicOrder &&
        selectedProductData?.productId &&
        selectedProductData?.tierPricing &&
        selectedProductData.tierPricing.length > 0 &&
        debouncedQuantity > 0
      ) {
        fetchTierPricing({
          variables: {
            productId: selectedProductData.productId,
            quantity: debouncedQuantity,
          },
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [debouncedQuantity, isClinicOrder, selectedProductData, fetchTierPricing]);

  // Update price when tier pricing data is received
  useEffect(() => {
    if (
      tierPricingData?.fetchTierPricing?.tieredPrice &&
      isClinicOrder &&
      formikSetFieldValueRef.current &&
      debouncedQuantity !== null // Only update if we have a valid quantity
    ) {
      const newPrice = tierPricingData.fetchTierPricing.tieredPrice;
      // Only update the price field, don't update preservedPrice to avoid form reinitialization
      // This ensures quantity field doesn't reset
      formikSetFieldValueRef.current("price", newPrice);
    }
  }, [tierPricingData, isClinicOrder, debouncedQuantity]);

  const handleAddItem = async (values: {
    customer: string;
    product: string;
    quantity: number;
    price: number;
  }) => {
    // lock on first item (only for customer orders)
    if (!isClinicOrder && !lockedCustomer) setLockedCustomer(values.customer);

    // Original price is variants[0].price
    const originalPrice =
      selectedProductData?.variants?.[0]?.price ?? values.price;
    const customPrice = selectedProductData?.customPrice;
    const productId = selectedProductData?.productId || "";

    // Check if the same product already exists in order items
    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === productId && item.variantId === selectedProductData?.variantId
    );

    if (existingItemIndex !== -1) {
      // Item already exists, merge quantities
      const existingItem = orderItems[existingItemIndex];
      const newQuantity = existingItem.quantity + values.quantity;
      let newPrice = existingItem.price;

      // If it's a clinic order with tiered pricing, fetch new price based on combined quantity
      if (isClinicOrder && existingItem.hasTierPricing && productId) {
        try {
          const { data } = await fetchTierPricing({
            variables: {
              productId: productId,
              quantity: newQuantity,
            },
          });

          if (data?.fetchTierPricing?.tieredPrice) {
            newPrice = data.fetchTierPricing.tieredPrice;
          }
        } catch (error) {
          console.error("Error fetching tier pricing for merged item:", error);
          // Keep existing price if API call fails
        }
      }

      // Update the existing item with merged quantity and new price
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        price: newPrice,
      };
      setOrderItems(updatedItems);
      return;
    }

    // The displayed price is customPrice if present, otherwise originalPrice
    // For clinic orders, use base price (originalPrice) instead of marked up
    const displayedPrice = isClinicOrder
      ? originalPrice
      : (customPrice ?? originalPrice);

    // Validate price is not greater than latest marked up price (skip for clinic orders)
    if (
      !isClinicOrder &&
      latestMarkedUpPrice !== null &&
      values.price > latestMarkedUpPrice
    ) {
      showErrorToast(
        `Price cannot exceed the latest marked up price ($${latestMarkedUpPrice.toFixed(
          2
        )})`
      );
      return;
    }

    const newItem: OrderItem = {
      product: values.product,
      productId: productId,
      variantId: selectedProductData?.variantId || "",
      quantity: values.quantity,
      price: values.price,
      originalPrice: originalPrice,
      customPrice: customPrice,
      initialPrice: displayedPrice, // Store the displayed price (customPrice or originalPrice) when item was added
      hasTierPricing: isClinicOrder && (selectedProductData?.tierPricing?.length ?? 0) > 0,
      latestMarkedUpPrice: latestMarkedUpPrice, // Store latest marked up price for validation
    };

    setOrderItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = async (
    index: number,
    field: keyof OrderItem,
    value: number
  ) => {
    const updated = [...orderItems];
    const currentItem = updated[index];
    
    // If quantity is being updated and it's a clinic order with tiered pricing, fetch new price
    if (field === "quantity" && isClinicOrder && currentItem.hasTierPricing && currentItem.productId) {
      try {
        const { data } = await fetchTierPricing({
          variables: {
            productId: currentItem.productId,
            quantity: value,
          },
        });
        
        if (data?.fetchTierPricing?.tieredPrice) {
          updated[index] = { 
            ...currentItem, 
            [field]: value,
            price: data.fetchTierPricing.tieredPrice 
          };
        } else {
          updated[index] = { ...currentItem, [field]: value };
        }
      } catch (error) {
        console.error("Error fetching tier pricing:", error);
        // If API fails, just update quantity without changing price
        updated[index] = { ...currentItem, [field]: value };
      }
    } else {
      updated[index] = { ...currentItem, [field]: value };
    }
    
    setOrderItems(updated);
    
    // Validate price for non-clinic orders when price is updated
    if (field === "price") {
      if (!isClinicOrder) {
        // Validate price against original price and latest marked up price for non-clinic orders
        const updatedItem = updated[index];
        let errorMessage: string | null = null;
        
        if (updatedItem.price < updatedItem.originalPrice) {
          errorMessage = `Price must be greater than or equal to original price ($${updatedItem.originalPrice.toFixed(2)})`;
        } else if (
          updatedItem.latestMarkedUpPrice !== null &&
          updatedItem.latestMarkedUpPrice !== undefined &&
          updatedItem.price > updatedItem.latestMarkedUpPrice
        ) {
          errorMessage = `Price cannot exceed the latest marked up price ($${updatedItem.latestMarkedUpPrice.toFixed(2)})`;
        }
        
        if (errorMessage) {
          setPriceErrors((prev) => ({
            ...prev,
            [index]: errorMessage!,
          }));
        } else {
          // Clear error if price is valid
          setPriceErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });
        }
      } else {
        // For clinic orders, just clear any existing errors
        setPriceErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    }
  };

  const handleDeleteItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
    // Clear error for deleted item and reindex remaining errors
    setPriceErrors((prev) => {
      const newErrors: { [index: number]: string } = {};
      Object.keys(prev).forEach((key) => {
        const errorIndex = parseInt(key);
        if (errorIndex < index) {
          newErrors[errorIndex] = prev[errorIndex];
        } else if (errorIndex > index) {
          newErrors[errorIndex - 1] = prev[errorIndex];
        }
      });
      return newErrors;
    });
  };

  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) return;

    // Validate all order items before creating order (only for non-clinic orders)
    if (!isClinicOrder) {
      const errors: { [index: number]: string } = {};
      orderItems.forEach((item, index) => {
        if (item.price < item.originalPrice) {
          errors[
            index
          ] = `Price must be greater than or equal to original price ($${item.originalPrice.toFixed(
            2
          )})`;
        } else if (
          item.latestMarkedUpPrice !== null &&
          item.latestMarkedUpPrice !== undefined &&
          item.price > item.latestMarkedUpPrice
        ) {
          errors[
            index
          ] = `Price cannot exceed the latest marked up price ($${item.latestMarkedUpPrice.toFixed(
            2
          )})`;
        }
      });

      // If there are validation errors, show them and prevent order creation
      if (Object.keys(errors).length > 0) {
        setPriceErrors(errors);
        showErrorToast("Please fix price errors before creating the order");
        return;
      }
    }

    // Clear any previous errors
    setPriceErrors({});

    try {
      // Transform order items to match the expected GraphQL input format
      const orderItemsInput = orderItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));

      if (isClinicOrder) {
        // Clinic order: no patient, no custom pricing (same as ClinicOrderModal)
        await createOrder({
          variables: {
            orderItems: orderItemsInput,
            totalPrice: totalAmount,
            patientId: null,
            useCustomPricing: false,
          },
        });
      } else {
        // Customer order: require selected customer
        if (!selectedCustomerData) {
          showErrorToast("Customer not found");
          return;
        }
        // Check if any product price has been manually changed from its initial value
        const useCustomPricing = orderItems.some(
          (item) =>
            Math.round(item.price * 100) !== Math.round(item.initialPrice * 100)
        );
        await createOrder({
          variables: {
            orderItems: orderItemsInput,
            totalPrice: totalAmount,
            patientId: selectedCustomerData.id,
            useCustomPricing,
          },
        });
      }

      // Reset form state
      setLockedCustomer(null);
      setOrderItems([]);
      setCustomerDraft("");
      setPriceErrors({});
      setProductBasePrice(null);
      setLatestMarkedUpPrice(null);

      // Refetch products to get latest prices for next order
      if (productSelectRef.current) {
        productSelectRef.current.refetch();
      }

      showSuccessToast("Order created successfully");
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={router.back}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Create New Order
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 bg-white rounded-xl">
        <div className="flex flex-col gap-4 py-4 px-3 md:p-5 xl:p-6 border-e border-gray-200">
          <h2 className="text-black font-medium text-xl">Order Details</h2>

          <Formik
            initialValues={{
              customer: customerDraft,
              product: preservedProduct,
              quantity: 1,
              price: preservedPrice,
            }}
            validationSchema={OrderSchema}
            enableReinitialize
            onSubmit={(values, { resetForm }) => {
              handleAddItem(values);
              setPreservedProduct(""); // Clear preserved product when item is added
              setPreservedPrice(0);
              resetForm({
                values: {
                  customer: values.customer,
                  product: "",
                  quantity: 1,
                  price: 0,
                },
              });
            }}
          >
            {({
              values,
              setFieldValue,
              setFieldTouched,
              setFieldError,
              errors,
              touched,
            }) => {
              // Store setFieldValue in ref for use in useEffect
              formikSetFieldValueRef.current = setFieldValue;
              
              return (
              <Form className="flex flex-col gap-4 md:gap-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-700 text-sm font-medium">
                    My clinic&apos;s order
                  </span>
                  <Switch
                    checked={isClinicOrder}
                    disabled={orderItems.length > 0}
                    onChange={(checked) => {
                      setIsClinicOrder(checked);
                      // Reset debounced quantity when clinic toggle changes
                      setDebouncedQuantity(null);
                      if (checked) {
                        setLockedCustomer(null);
                        setSelectedCustomerData(null);
                        setCustomerDraft("");
                        setFieldValue("customer", "");
                        // Clinic order: show base price in the price input
                        if (
                          selectedProductData &&
                          productBasePrice !== null
                        ) {
                          setFieldValue("price", productBasePrice);
                          setPreservedPrice(productBasePrice);
                        }
                      } else {
                        // Non‑clinic (customer order): only marked-up products allowed
                        const isMarkedUp =
                          (selectedProductData?.customPriceChangeHistory
                            ?.length ?? 0) > 0;
                        if (selectedProductData && !isMarkedUp) {
                          // Selected product is not marked up; clear it (cannot use for customer orders)
                          setFieldValue("product", "");
                          setPreservedProduct("");
                          setSelectedProductData(null);
                          setFieldValue("price", 0);
                          setPreservedPrice(0);
                          updatePricingInfo(null);
                        } else if (selectedProductData) {
                          // Product is marked up: show latest marked up price in the price input
                          const priceToUse =
                            latestMarkedUpPrice ?? productBasePrice ?? 0;
                          setFieldValue("price", priceToUse);
                          setPreservedPrice(priceToUse);
                        }
                      }
                    }}
                    className={`group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-gradient-to-r data-checked:from-[#3C85F5] data-checked:to-[#1A407A] ${
                      orderItems.length > 0
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
                  </Switch>
                </div>
                {!isClinicOrder && (
                <div>
                  <CustomerSelect
                    selectedCustomer={values.customer}
                    setSelectedCustomer={(val: string) => {
                      if (lockedCustomer) return; // prevent changing after first item
                      // Preserve current product value when customer changes
                      setPreservedProduct(values.product);
                      setFieldValue("customer", val);
                      setCustomerDraft(val);
                    }}
                    errors={errors.customer || ""}
                    touched={touched.customer}
                    disabled={!!lockedCustomer}
                    placeholder={
                      lockedCustomer ? "Customer locked" : "Select a customer"
                    }
                    required={true}
                    showLabel={true}
                    paddingClasses="py-2.5 h-11 px-2"
                    optionPaddingClasses="p-1"
                    onCustomerChange={(customer) => {
                      setSelectedCustomerData(customer);
                      // // Refetch products when customer changes to get latest prices
                      // if (productSelectRef.current) {
                      //   productSelectRef.current.refetch();
                      // }
                    }}
                  />
                </div>
                )}
                <div>
                  <ProductSelect
                    fetchMarkedUpProductsOnly={!isClinicOrder}
                    ref={productSelectRef}
                    selectedProduct={values.product}
                    setSelectedProduct={(product) => {
                      setFieldValue("product", product);
                      setPreservedProduct(product);
                    }}
                    errors={errors.product || ""}
                    touched={touched.product}
                    onProductChange={(selectedProduct) => {
                      setSelectedProductData(selectedProduct);

                      // Update pricing information from the product data (already fetched in ProductSelect)
                      updatePricingInfo(selectedProduct);

                      // Reset validation errors when product changes
                      setFieldTouched("product", false);
                      setFieldTouched("price", false);
                      setFieldError("product", undefined);
                      setFieldError("price", undefined);

                      // Reset debounced quantity when product changes
                      setDebouncedQuantity(null);

                      // Auto-populate price when product is selected
                      // Clinic: tiered price (if available) or base price. Non‑clinic: latest marked up price.
                      if (selectedProduct) {
                        const basePrice =
                          selectedProduct.variants?.[0]?.price ??
                          selectedProduct.originalPrice ??
                          selectedProduct.price ??
                          0;
                        let latestMarkedUp: number | null = null;
                        const ph = selectedProduct.customPriceChangeHistory;
                        if (ph?.length) {
                          const sorted = [...ph].sort(
                            (a, b) =>
                              (new Date(b.createdAt ?? 0).getTime()) -
                              (new Date(a.createdAt ?? 0).getTime())
                          );
                          if (sorted[0]?.customPrice != null)
                            latestMarkedUp = Number(sorted[0].customPrice);
                        }
                        const latestMarkedUpValue =
                          latestMarkedUp ??
                          selectedProduct.customPrice ??
                          selectedProduct.originalPrice ??
                          selectedProduct.variants?.[0]?.price ??
                          selectedProduct.price ??
                          0;
                        
                        // For clinic orders, use tiered pricing if available (quantity 1 = first tier)
                        let priceToUse: number;
                        if (isClinicOrder && selectedProduct.tierPricing && selectedProduct.tierPricing.length > 0) {
                          // Get price for quantity 1 (first tier)
                          const firstTier = selectedProduct.tierPricing.find(tier => tier.startCount === 1);
                          priceToUse = firstTier?.tieredPrice ?? basePrice;
                        } else {
                          priceToUse = isClinicOrder ? basePrice : latestMarkedUpValue;
                        }
                        
                        setPreservedPrice(priceToUse);
                        setPreservedProduct(selectedProduct.name);
                        setFieldValue("price", priceToUse);
                      } else {
                        // Reset price if no product selected
                        setPreservedPrice(0);
                        setFieldValue("price", 0);
                      }
                    }}
                  />
                </div>

                {/* Pricing Information Display */}
                {!isClinicOrder && preservedProduct &&
                  (productBasePrice !== null ||
                    latestMarkedUpPrice !== null) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-1 border border-gray-200 w-full">
                      <h3 className="text-gray-700 font-medium text-xs md:text-sm mb-2">
                        Pricing Information
                      </h3>
                      <div className="flex flex-col gap-2">
                        {productBasePrice !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs md:text-sm">
                              Base Price
                            </span>
                            <span className="text-gray-800 font-semibold text-xs md:text-sm">
                              ${productBasePrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {latestMarkedUpPrice !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-xs md:text-sm">
                              Latest Marked Up Price
                            </span>
                            <span className="text-gray-800 font-semibold text-xs md:text-sm">
                              ${latestMarkedUpPrice.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Tiered Pricing Display for Clinic Orders */}
                {isClinicOrder && preservedProduct && selectedProductData?.tierPricing && selectedProductData.tierPricing.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-1 border border-gray-200 w-full">
                    <h3 className="text-gray-700 font-medium text-xs md:text-sm mb-3">
                      Tiered Pricing
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Quantity Range</th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Price per Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProductData.tierPricing.map((tier, index) => (
                            <tr key={tier.id || index} className="border-b border-gray-100">
                              <td className="py-2 px-2 text-gray-700">
                                {tier.startCount}+
                              </td>
                              <td className="py-2 px-2 text-right text-gray-800 font-semibold">
                                ${tier.tieredPrice.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className={`flex gap-4 flex-row`}>
                  <div className="w-full">
                    <Field
                      as={ThemeInput}
                      label="Quantity"
                      name="quantity"
                      placeholder="Enter quantity"
                      type="number"
                      id="quantity"
                      required={true}
                      min="1"
                      step="1"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (
                          e.key === "-" ||
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "+" ||
                          e.key === "."
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData("text");
                        // Remove minus signs and other invalid characters
                        const cleaned = pastedText.replace(/[-\+eE]/g, "");
                        const numValue = parseFloat(cleaned);
                        if (!isNaN(numValue) && numValue > 0) {
                          setFieldValue("quantity", Math.floor(numValue));
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        let value = e.target.value;
                        // Remove minus sign and any negative values
                        value = value.replace(/-/g, "");
                        // Remove any non-numeric characters except digits
                        value = value.replace(/[^0-9]/g, "");
                        // If value is empty or valid, set it; otherwise set to minimum (1)
                        if (value === "") {
                          setFieldValue("quantity", "");
                          setDebouncedQuantity(null);
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            setFieldValue("quantity", numValue);
                            
                            // Set debounced quantity for tier pricing API call
                            // This will trigger the useEffect that calls the API
                            if (
                              isClinicOrder &&
                              selectedProductData?.tierPricing &&
                              selectedProductData.tierPricing.length > 0
                            ) {
                              setDebouncedQuantity(numValue);
                            } else {
                              // Fallback to local calculation if not clinic order or no tier pricing
                              const tieredPrice = getTieredPrice(numValue);
                              if (tieredPrice !== null) {
                                setFieldValue("price", tieredPrice);
                                setPreservedPrice(tieredPrice);
                              }
                            }
                          } else {
                            setFieldValue("quantity", 1);
                            setDebouncedQuantity(1);
                          }
                        }
                      }}
                    />
                    {errors.quantity && touched.quantity && (
                      <p className="text-red-500 text-xs">{errors.quantity}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <Field
                      as={ThemeInput}
                      label="Price ($)"
                      name="price"
                      placeholder="Enter price"
                      type="number"
                      id="price"
                      required={true}
                      min="0.01"
                      step="0.01"
                    />
                    {errors.price && touched.price && (
                      <p className="text-red-500 text-xs">{errors.price}</p>
                    )}
                  </div>
                </div>

                <ThemeButton
                  label="Add to Order"
                  type="submit"
                  icon={<PlusIcon />}
                  variant="primaryOutline"
                />
              </Form>
            );
            }}
          </Formik>
        </div>

        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center gap-3 border-b border-gray-200">
            <h2 className="text-black font-medium text-xl">Order Items</h2>
            <span className="bg-blue-50 border rounded-full text-xs py-0.5 px-2.5 border-blue-200 text-blue-700">
              {orderItems.length}
            </span>
          </div>

          <div className="h-full">
            {orderItems.length === 0 ? (
              <div className="flex items-center flex-col gap-4 p-5 justify-center h-full text-gray-900">
                <Image
                  src={"/images/fallbackImages/noItemIllu.svg"}
                  alt=""
                  width={720}
                  height={720}
                  className="md:w-40 w-32 h-32 md:h-40"
                  unoptimized
                />
                No item added to order yet
              </div>
            ) : (
              <>
                <div className="hidden sm:grid grid-cols-6 text-black text-xs font-medium bg-gray-100 py-2 px-3">
                  <div className="col-span-2">Product</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>Total</div>
                  <div>Actions</div>
                </div>

                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 sm:gap-0 gap-2 bg-gray-50 items-center py-2 mb-0.5 px-3"
                  >
                    <div className="col-span-6 sm:col-span-2 text-xs md:text-sm">
                      {item.product}
                    </div>

                    <div className="col-span-2 sm:col-auto">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onKeyDown={(e) => {
                          if (
                            e.key === "-" ||
                            e.key === "e" ||
                            e.key === "E" ||
                            e.key === "+" ||
                            e.key === "."
                          ) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          // Remove minus signs and other invalid characters
                          const cleaned = pastedText.replace(/[-\+eE.]/g, "");
                          const numValue = parseInt(cleaned, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            handleUpdateItem(index, "quantity", numValue);
                          }
                        }}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Remove minus sign and any non-numeric characters
                          value = value.replace(/[^0-9]/g, "");
                          // Prevent negative values
                          if (value === "") {
                            handleUpdateItem(index, "quantity", 1);
                          } else {
                            const numValue = parseInt(value, 10);
                            if (!isNaN(numValue) && numValue > 0) {
                              handleUpdateItem(index, "quantity", numValue);
                            } else {
                              handleUpdateItem(index, "quantity", 1);
                            }
                          }
                        }}
                        className="rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs"
                      />
                    </div>

                    <div className="col-span-2 sm:col-auto">
                      <div className="flex flex-col">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            if (!isNaN(newPrice) && newPrice > 0) {
                              handleUpdateItem(index, "price", newPrice);
                            }
                          }}
                          className={`rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs ${
                            !isClinicOrder && priceErrors[index] ? "border-red-500" : ""
                          }`}
                        />
                        {!isClinicOrder && priceErrors[index] && (
                          <p className="text-red-500 text-[12px] mt-0.5 me-2">
                            {priceErrors[index]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs md:text-sm whitespace-nowrap">
                      ${formatNumber(item.quantity * item.price)}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="rounded-md w-8 h-8 flex items-center border bg-white border-gray-200 justify-center hover:bg-red-100"
                      >
                        <TrashBinIcon width="12" height="12" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="py-2 px-3 md:px-4 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-black text-base md:text-lg font-semibold">
                      Total Amount:
                    </span>
                    <span className="text-primary text-base md:text-lg font-semibold">
                      ${formatNumber(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    {createOrderError && (
                      <p className="text-red-500 text-xs mb-2">
                        Error creating order: {createOrderError.message}
                      </p>
                    )}
                    <ThemeButton
                      label={
                        createOrderLoading
                          ? "Creating Order..."
                          : "Create Order"
                      }
                      onClick={handleCreateOrder}
                      size="medium"
                      icon={<PlusIcon height="18" width="18" />}
                      heightClass="h-10"
                      className="w-full sm:w-fit"
                      disabled={createOrderLoading || orderItems.length === 0}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
