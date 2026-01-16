"use client";
import React, { useState } from "react";
import AppModal from "./AppModal";
import { PlusIcon, ShopingCartIcon, TrashBinIcon } from "@/icons";
import { SelectGroupDropdown, ProductSelect } from "@/app/components";
import ThemeInput from "../inputs/ThemeInput";
import ThemeButton from "../buttons/ThemeButton";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { formatNumber } from "@/lib/helpers";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import { FETCH_PRODUCT } from "@/lib/graphql/queries";
import { FetchProductResponse } from "@/types/products";
import { useParams } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";

type DropdownItem = {
  name: string;
  displayName: string;
  email?: string;
  id?: string;
  productId?: string;
  variantId?: string;
  price?: number;
  customPrice?: number;
  originalPrice?: number;
  variants?: Array<{
    id?: string;
    shopifyVariantId?: string;
    price?: number;
    sku?: string;
  }>;
};

interface OrderItem {
  product: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  initialPrice: number; // Track the initial displayed price when item was added
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer?: DropdownItem;
  customers?: DropdownItem[];
  patientId?: string;
  onCreateOrder?: (data: {
    customer: string;
    items: OrderItem[];
    totalAmount: number;
  }) => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  customers = [],
  patientId: patientIdProp,
  onCreateOrder,
}) => {
  // Get patient ID from props or URL params
  const params = useParams();
  const patientId = patientIdProp || (params.id as string);
  const [showItems, setShowItems] = useState(false);
  const isMobile = useIsMobile();
  // GraphQL mutation to create order
  const [
    createOrder,
    { loading: createOrderLoading, error: createOrderError },
  ] = useMutation(CREATE_ORDER);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerDraft, setCustomerDraft] = useState("");
  const [lockedCustomer, setLockedCustomer] = useState<string | null>(
    currentCustomer?.displayName || null
  );
  const [selectedProductData, setSelectedProductData] =
    useState<DropdownItem | null>(null);
  const [priceErrors, setPriceErrors] = useState<{ [index: number]: string }>(
    {}
  );
  const [productBasePrice, setProductBasePrice] = useState<number | null>(null);
  const [latestMarkedUpPrice, setLatestMarkedUpPrice] = useState<number | null>(
    null
  );

  // Lazy query to fetch full product data with pricing history
  const [fetchProduct, { loading: fetchingProduct }] =
    useLazyQuery<FetchProductResponse>(FETCH_PRODUCT, {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: false,
      onCompleted: (data) => {
        if (data?.fetchProduct) {
          const product = data.fetchProduct;

          // Set base price (original price before markup)
          const basePriceValue =
            product.price || product.variants?.[0]?.price || 0;
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
            }
          } else {
            setLatestMarkedUpPrice(null);
          }
        }
      },
      onError: (error) => {
        console.error("Error fetching product pricing history:", error);
        setProductBasePrice(null);
        setLatestMarkedUpPrice(null);
      },
    });

  // Create OrderSchema inside component to access selectedProductData
  const OrderSchema = React.useMemo(() => {
    return Yup.object().shape({
      customer: currentCustomer
        ? Yup.string().optional() // if parent already provides customer
        : Yup.string().required("Customer is required"),
      product: Yup.string().required("Product is required"),
      quantity: Yup.number()
        .min(1, "Minimum 1")
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
        }),
    });
  }, [currentCustomer, selectedProductData]);

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
    const initialPrice = customPrice ?? originalPrice;

    // Validate price is not less than original price
    if (values.price < originalPrice) {
      showErrorToast(
        `Price must be greater than or equal to original price ($${originalPrice.toFixed(
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
      initialPrice: initialPrice, // Store the displayed price (customPrice or originalPrice) when item is added
    };

    setOrderItems((prev) => [...prev, newItem]);
    showSuccessToast("Item added to order successfully");
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
    if (orderItems.length === 0) {
      showErrorToast("Please add at least one item to the order");
      return;
    }

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
      // Validate that patientId exists

      // Transform order items to match the expected GraphQL input format
      const orderItemsInput = orderItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      }));

      // Check if any product price has been changed from initial displayed price
      // If customPrice was present initially, compare with initialPrice
      // If user changed the price from what was initially shown, useCustomPricing should be true
      const useCustomPricing = orderItems.some(
        (item) => item.price !== item.initialPrice
      );

      await createOrder({
        variables: {
          orderItems: orderItemsInput,
          totalPrice: totalAmount,
          patientId: patientId,
          useCustomPricing: useCustomPricing,
        },
      });

      // Call the parent callback if provided
      if (onCreateOrder) {
        onCreateOrder({
          customer: lockedCustomer || customerDraft,
          items: orderItems,
          totalAmount,
        });
      }

      // Reset state for the next order
      setOrderItems([]);
      setCustomerDraft("");
      setPriceErrors({});
      setProductBasePrice(null);
      setLatestMarkedUpPrice(null);
      if (!currentCustomer) {
        setLockedCustomer(null);
      }

      showSuccessToast("Order created successfully");
      setShowItems(false);
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        if (showItems) {
          setShowItems(false);
        } else {
          // Reset pricing info when closing
          setProductBasePrice(null);
          setLatestMarkedUpPrice(null);
          onClose();
        }
      }}
      hideCancelBtn={!showItems}
      onConfirm={() => {
        if (showItems) {
          handleCreateOrder();
        } else setShowItems(true);
      }}
      confirmLabel={
        showItems && createOrderLoading
          ? "Creating Order"
          : showItems && !createOrderLoading
          ? "Create Order"
          : "Continue"
      }
      confimBtnDisable={
        orderItems.length > 0 && !createOrderLoading ? false : true
      }
      cancelLabel="Back"
      title="Create New Order"
      showFooter={isMobile}
      btnIcon={showItems && <PlusIcon />}
      size="extraLarge"
      outSideClickClose={false}
      icon={<ShopingCartIcon fill="#374151" height={16} width={16} />}
      bodyPaddingClasses="p-0"
      hideCrossButton={showItems}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {(!showItems || !isMobile) && (
          <div className="flex flex-col gap-4 p-5 xl:p-6 border-e border-gray-200">
            <h2 className="text-black font-medium text-xl">Order Details</h2>

            <Formik
              initialValues={{
                customer: customerDraft,
                product: "",
                quantity: 1,
                price: 0,
              }}
              validationSchema={OrderSchema}
              enableReinitialize
              onSubmit={(values, { resetForm }) => {
                handleAddItem(values);
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
              {({ values, setFieldValue, errors, touched }) => (
                <Form className="flex flex-col gap-5">
                  {!currentCustomer && (
                    <div>
                      <SelectGroupDropdown
                        selectedGroup={values.customer}
                        setSelectedGroup={(val: string | string[]) => {
                          if (lockedCustomer) return; // prevent changing after first item
                          const v = Array.isArray(val) ? val[0] : val;
                          setFieldValue("customer", v);
                          setCustomerDraft(v);
                        }}
                        groups={customers}
                        errors={errors.customer || ""}
                        name="Customer"
                        multiple={false}
                        placeholder={
                          lockedCustomer
                            ? "Customer locked"
                            : "Select a customer"
                        }
                        isShowDrop={!lockedCustomer}
                        searchTerm={""}
                        setSearchTerm={() => {}}
                        required={true}
                        paddingClasses="py-2.5 h-11 px-2"
                        optionPaddingClasses="p-1"
                        showLabel={true}
                        showIcon={false}
                        disabled={lockedCustomer ? true : false}
                      />
                      {errors.customer && touched.customer && (
                        <p className="text-red-500 text-xs">
                          {errors.customer}
                        </p>
                      )}
                    </div>
                  )}
                  <ProductSelect
                    fetchMarkedUpProductsOnly={true}
                    selectedProduct={values.product}
                    setSelectedProduct={(product) =>
                      setFieldValue("product", product)
                    }
                    errors={errors.product || ""}
                    touched={touched.product}
                    onProductChange={(selectedProduct) => {
                      setSelectedProductData(selectedProduct);

                      // Fetch full product data to get pricing history
                      if (selectedProduct?.productId) {
                        fetchProduct({
                          variables: { id: selectedProduct.productId },
                        });
                      } else {
                        // Reset pricing info if no product selected
                        setProductBasePrice(null);
                        setLatestMarkedUpPrice(null);
                      }

                      // Auto-populate price when product is selected
                      // Use customPrice if present, otherwise use originalPrice or variants[0].price
                      if (selectedProduct) {
                        const priceToUse =
                          selectedProduct.customPrice ??
                          selectedProduct.originalPrice ??
                          selectedProduct.variants?.[0]?.price ??
                          selectedProduct.price ??
                          0;
                        setFieldValue("price", priceToUse);
                      }
                    }}
                  />

                  <div
                    className={`flex gap-4 ${
                      currentCustomer ? "flex-col" : "flex-row"
                    }`}
                  >
                    <div className="w-full">
                      <Field
                        as={ThemeInput}
                        label="Quantity"
                        name="quantity"
                        placeholder="Enter quantity"
                        type="number"
                        id="quantity"
                        className="[&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        required={true}
                        min="1"
                        step="1"
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
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
                        onPaste={(
                          e: React.ClipboardEvent<HTMLInputElement>
                        ) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData("text");
                          // Remove minus signs and other invalid characters
                          const cleaned = pastedText.replace(/[-\+eE.]/g, "");
                          const numValue = parseFloat(cleaned);
                          if (!isNaN(numValue) && numValue > 0) {
                            setFieldValue("quantity", Math.floor(numValue));
                          }
                        }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          let value = e.target.value;
                          // Remove minus sign and any non-numeric characters
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
                        <p className="text-red-500 text-xs">
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      {/* Pricing Information Display */}
                      {(productBasePrice !== null ||
                        latestMarkedUpPrice !== null) && (
                        <div className="bg-gray-50 rounded-lg p-2 mb-2 border border-gray-200">
                          <h3 className="text-gray-700 font-medium text-xs mb-1.5">
                            Pricing Information
                          </h3>
                          <div className="flex flex-col gap-1.5">
                            {productBasePrice !== null && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-xs">
                                  Base Price
                                </span>
                                <span className="text-gray-800 font-semibold text-xs">
                                  ${productBasePrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {latestMarkedUpPrice !== null && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-xs">
                                  Latest Marked Up Price
                                </span>
                                <span className="text-gray-800 font-semibold text-xs">
                                  ${latestMarkedUpPrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
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
                    variant="outline"
                  />
                </Form>
              )}
            </Formik>
          </div>
        )}

        {(showItems || !isMobile) && (
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-3 border-b border-gray-200">
              <h2 className="text-black font-medium text-xl">Order Items</h2>
              <span className="bg-blue-50 border rounded-full text-xs py-0.5 px-2.5 border-blue-200 text-blue-700">
                {orderItems.length}
              </span>
            </div>

            <div className="h-full">
              {orderItems.length === 0 ? (
                <div className="flex items-center flex-col gap-4 justify-center h-full text-gray-900">
                  <Image
                    src={"/images/fallbackImages/noItemIllu.svg"}
                    alt=""
                    width={720}
                    height={720}
                    className="w-40 h-40"
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
                          value={item.quantity}
                          min="1"
                          step="1"
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
                          className="rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
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

                                // Validate in real-time
                                const originalPrice = item.originalPrice;
                                if (newPrice < originalPrice) {
                                  setPriceErrors((prev) => ({
                                    ...prev,
                                    [index]: `Price must be greater than or equal to original price ($${originalPrice.toFixed(
                                      2
                                    )})`,
                                  }));
                                } else {
                                  setPriceErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors[index];
                                    return newErrors;
                                  });
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-"].includes(e.key)) {
                                e.preventDefault();
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

                      <div>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="rounded-md w-8 h-8 flex items-center border bg-white border-gray-200 justify-center hover:bg-red-100"
                        >
                          <TrashBinIcon width="12" height="12" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="py-2 px-4 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-black text-lg font-semibold">
                        Total Amount:
                      </span>
                      <span className="text-primary text-lg font-semibold">
                        ${formatNumber(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      {createOrderError && (
                        <p className="text-red-500 text-xs mb-2">
                          Error creating order: {createOrderError.message}
                        </p>
                      )}
                      <div className="hidden sm:block">
                        <ThemeButton
                          label={
                            createOrderLoading
                              ? "Creating Order..."
                              : "Create Order"
                          }
                          icon={<PlusIcon height="18" width="18" />}
                          onClick={handleCreateOrder}
                          size="medium"
                          heightClass="h-10"
                          disabled={
                            createOrderLoading || orderItems.length === 0
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default NewOrderModal;
