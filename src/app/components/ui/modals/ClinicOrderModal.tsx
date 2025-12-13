"use client";
import React, { useState, useEffect } from "react";
import AppModal from "./AppModal";
import { CrossIcon, PlusIcon, ShopingCartIcon, TrashBinIcon } from "@/icons";
import { ProductSelect } from "@/app/components";
import ThemeInput from "../inputs/ThemeInput";
import ThemeButton from "../buttons/ThemeButton";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { formatNumber } from "@/lib/helpers";
import { useIsMobile } from "@/hooks/useIsMobile";

type DropdownItem = {
  name: string;
  displayName: string;
  email?: string;
  id?: string;
  productId?: string;
  variantId?: string;
  price?: number;
  originalPrice?: number;
  customPrice?: number;
};

export interface OrderItem {
  product: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice: number;
}

interface ClinicOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (data: { items: OrderItem[]; totalAmount: number }) => void;
}

const ClinicOrderModal: React.FC<ClinicOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
}) => {
  const [showItems, setShowItems] = useState(false);
  const isMobile = useIsMobile();

  const OrderSchema = Yup.object().shape({
    product: Yup.string().required("Product is required"),
    quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
    price: Yup.number()
      .min(0.01, "Must be greater than 0")
      .required("Price is required"),
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductData, setSelectedProductData] =
    useState<DropdownItem | null>(null);

  // Reset order items and form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderItems([]);
      setShowItems(false);
      setSelectedProductData(null);
    }
  }, [isOpen]);

  const handleAddItem = (values: {
    product: string;
    quantity: number;
    price: number;
  }) => {
    // Use originalPrice (actual price) for clinic orders, not customPrice
    // Never use selectedProductData.price as it may contain customPrice
    const originalPrice = selectedProductData?.originalPrice ?? values.price;

    const newItem: OrderItem = {
      product: values.product,
      productId: selectedProductData?.productId || "",
      variantId: selectedProductData?.variantId || "",
      quantity: values.quantity,
      price: values.price,
      originalPrice: originalPrice,
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
  };

  const handleDeleteItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
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

    try {
      onCreateOrder({
        items: orderItems,
        totalAmount,
      });

      // Reset state for the next order
      setOrderItems([]);
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
          onClose();
        }
      }}
      hideCancelBtn={!showItems}
      onConfirm={() => {
        if (showItems) {
          handleCreateOrder();
        } else setShowItems(true);
      }}
      confirmLabel={showItems ? "Create Order" : "Continue"}
      confimBtnDisable={
        orderItems.length > 0 && !showItems
          ? false
          : showItems && orderItems.length === 0
      }
      cancelLabel="Back"
      title="Create New Clinic Order"
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
                    product: "",
                    quantity: 1,
                    price: 0,
                  },
                });
              }}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form className="flex flex-col gap-5">
                  <ProductSelect
                    selectedProduct={values.product}
                    setSelectedProduct={(product) =>
                      setFieldValue("product", product)
                    }
                    errors={errors.product || ""}
                    touched={touched.product}
                    onProductChange={(selectedProduct) => {
                      setSelectedProductData(selectedProduct);
                      // Auto-populate price when product is selected
                      // Use originalPrice (actual price) instead of customPrice for clinic orders
                      if (selectedProduct) {
                        // Only use originalPrice (actual variant price) for clinic orders
                        // Never use price field as it may contain customPrice
                        const actualPrice = selectedProduct.originalPrice ?? 0;
                        setFieldValue("price", actualPrice);
                      }
                    }}
                  />

                  <div className="flex gap-4 flex-row">
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
                      <Field
                        as={ThemeInput}
                        label="Price ($)"
                        name="price"
                        placeholder="Enter price"
                        type="number"
                        id="price"
                        required={true}
                        disabled={true}
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
                  />
                  No item added to order yet
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-6 text-black text-xs font-medium bg-gray-100 py-2 px-3">
                    <div className="col-span-2">Product</div>
                    <div>Quantity</div>
                    <div>Unit Price</div>
                    <div>Total</div>
                    <div>Actions</div>
                  </div>

                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 bg-gray-50 items-center py-2 mb-0.5 px-3"
                    >
                      <div className="col-span-2 text-xs md:text-sm">
                        {item.product}
                      </div>

                      <div>
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

                      <div className="text-xs md:text-sm whitespace-nowrap">
                        ${formatNumber(item.price)}
                      </div>

                      <div className="text-xs md:text-sm whitespace-nowrap font-semibold">
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
                      <div className="hidden sm:block">
                        <ThemeButton
                          label="Create Order"
                          icon={<PlusIcon height="18" width="18" />}
                          onClick={handleCreateOrder}
                          size="medium"
                          heightClass="h-10"
                          disabled={orderItems.length === 0}
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

export default ClinicOrderModal;
