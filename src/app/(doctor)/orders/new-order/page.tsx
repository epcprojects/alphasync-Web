"use client";
import React, { useState, useRef, useMemo } from "react";
import { ArrowDownIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { ProductSelect, CustomerSelect } from "@/app/components";
import { ThemeInput, ThemeButton } from "@/app/components";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { formatNumber } from "@/lib/helpers";
import { useMutation } from "@apollo/client/react";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import type { ProductSelectRef } from "@/app/components/ui/inputs/ProductSelect";

interface OrderItem {
  product: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  customPrice?: number;
  initialPrice: number; // Track the initial price when item was added
}

const Page = () => {
  const router = useRouter();
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

  // Make OrderSchema dynamic to access latestMarkedUpPrice
  const OrderSchema = useMemo(() => {
    return Yup.object().shape({
      customer: Yup.string().required("Customer is required"),
      product: Yup.string().required("Product is required"),
      quantity: Yup.number()
        .min(1, "Minimum 1")
        .positive("Quantity must be positive")
        .required("Quantity is required"),
      price: Yup.number()
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
  }, [selectedProductData, latestMarkedUpPrice]);
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

  // GraphQL mutation to create order
  const [
    createOrder,
    { loading: createOrderLoading, error: createOrderError },
  ] = useMutation(CREATE_ORDER);

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

  const handleAddItem = (values: {
    customer: string;
    product: string;
    quantity: number;
    price: number;
  }) => {
    // lock on first item
    if (!lockedCustomer) setLockedCustomer(values.customer);

    // Original price is variants[0].price
    const originalPrice =
      selectedProductData?.variants?.[0]?.price ?? values.price;
    const customPrice = selectedProductData?.customPrice;

    // The displayed price is customPrice if present, otherwise originalPrice
    // This is what the user sees initially
    const displayedPrice = customPrice ?? originalPrice;

    // Validate price is not greater than latest marked up price
    if (latestMarkedUpPrice !== null && values.price > latestMarkedUpPrice) {
      showErrorToast(
        `Price cannot exceed the latest marked up price ($${latestMarkedUpPrice.toFixed(
          2
        )})`
      );
      return;
    }

    const newItem: OrderItem = {
      product: values.product,
      productId: selectedProductData?.productId || "",
      variantId: selectedProductData?.variantId || "",
      quantity: values.quantity,
      price: values.price,
      originalPrice: originalPrice,
      customPrice: customPrice,
      initialPrice: displayedPrice, // Store the displayed price (customPrice or originalPrice) when item is added
    };

    setOrderItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof OrderItem,
    value: number
  ) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
    // Clear error for this item when price is updated
    if (field === "price") {
      setPriceErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
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

    // Validate all order items before creating order
    const errors: { [index: number]: string } = {};
    orderItems.forEach((item, index) => {
      if (item.price < item.originalPrice) {
        errors[
          index
        ] = `Price must be greater than or equal to original price ($${item.originalPrice.toFixed(
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

    // Clear any previous errors
    setPriceErrors({});

    try {
      // Use the selected customer data
      if (!selectedCustomerData) {
        showErrorToast("Customer not found");
        return;
      }

      // Transform order items to match the expected GraphQL input format
      const orderItemsInput = orderItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));

      // Check if any product price has been manually changed from its initial value
      // useCustomPricing is true only if user has manually changed the price
      // Round to 2 decimal places to handle floating point precision issues
      const useCustomPricing = orderItems.some(
        (item) =>
          Math.round(item.price * 100) !== Math.round(item.initialPrice * 100)
      );

      await createOrder({
        variables: {
          orderItems: orderItemsInput,
          totalPrice: totalAmount,
          patientId: selectedCustomerData.id,
          useCustomPricing: useCustomPricing,
        },
      });

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
            }) => (
              <Form className="flex flex-col gap-4 md:gap-5">
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
                <div>
                  <ProductSelect
                    fetchMarkedUpProductsOnly={true}
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

                      // Auto-populate price when product is selected
                      // Use customPrice if present, otherwise use originalPrice or variants[0].price
                      if (selectedProduct) {
                        const priceToUse =
                          selectedProduct.customPrice ??
                          selectedProduct.originalPrice ??
                          selectedProduct.variants?.[0]?.price ??
                          selectedProduct.price ??
                          0;
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
                {preservedProduct &&
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
                        } else {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            setFieldValue("quantity", numValue);
                          } else {
                            setFieldValue("quantity", 1);
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
            )}
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
                            priceErrors[index] ? "border-red-500" : ""
                          }`}
                        />
                        {priceErrors[index] && (
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
