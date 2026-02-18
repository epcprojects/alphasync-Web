"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ArrowDownIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { ProductSelect, Skeleton } from "@/app/components";
import { ThemeInput, ThemeButton } from "@/app/components";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import { useApolloClient } from "@apollo/client";
import { UPDATE_ORDER_ITEMS } from "@/lib/graphql/mutations";
import { FETCH_ORDER, FETCH_PRODUCT, FETCH_TIER_PRICING } from "@/lib/graphql/queries";
import { FetchProductResponse } from "@/types/products";

interface OrderItem {
  product: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  customPrice?: number;
  initialPrice: number;
  initialQuantity?: number;
  hasTierPricing?: boolean;
  latestMarkedUpPrice?: number | null;
  /** Set for items loaded from the order; absent for newly added items */
  orderItemId?: string;
}

interface FetchedOrderItem {
  id: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product: {
    id: string;
    title: string;
    variants: { id: string; price: number; shopifyVariantId: string }[];
  };
}

interface FetchOrderResponse {
  fetchOrder: {
    id: string;
    displayId?: string | number;
    status: string;
    patient?: { id: string } | null;
    orderItems: FetchedOrderItem[];
  };
}

// Schema is built dynamically in the component to use latestMarkedUpPrice and selectedProductData

const Page = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const apolloClient = useApolloClient();

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [priceErrors, setPriceErrors] = useState<{ [index: number]: string }>({});
  const [selectedProductData, setSelectedProductData] = useState<{
    name: string;
    displayName: string;
    productId?: string;
    variantId?: string;
    price?: number;
    originalPrice?: number;
    customPrice?: number;
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
  const [latestMarkedUpPrice, setLatestMarkedUpPrice] = useState<number | null>(null);
  const [preservedProduct, setPreservedProduct] = useState("");
  const [preservedPrice, setPreservedPrice] = useState<number>(0);
  const lastTierFetchForItemRef = useRef<{ index: number; quantity: number } | null>(null);

  const AddItemSchema = useMemo(
    () =>
      Yup.object().shape({
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
            const originalPrice = selectedProductData.variants?.[0]?.price ?? 0;
            if (value < originalPrice) {
              return this.createError({
                message: `Price must be greater than or equal to original price ($${originalPrice.toFixed(2)})`,
              });
            }
            return true;
          })
          .test("less-than-latest-markup", function (value) {
            if (!value || latestMarkedUpPrice === null) return true;
            if (value > latestMarkedUpPrice) {
              return this.createError({
                message: `Price cannot exceed the latest marked up price ($${latestMarkedUpPrice.toFixed(2)})`,
              });
            }
            return true;
          }),
      }),
    [selectedProductData, latestMarkedUpPrice]
  );

  const updatePricingInfo = (product: typeof selectedProductData) => {
    if (!product) {
      setProductBasePrice(null);
      setLatestMarkedUpPrice(null);
      return;
    }
    const basePriceValue = product.variants?.[0]?.price ?? 0;
    setProductBasePrice(basePriceValue);
    const priceHistory = product.customPriceChangeHistory;
    if (priceHistory?.length) {
      const sorted = [...priceHistory].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
      const latest = sorted[0]?.customPrice;
      setLatestMarkedUpPrice(latest != null ? Number(latest) : null);
    } else {
      setLatestMarkedUpPrice(null);
    }
  };

  const { data: orderData, loading: orderLoading, error: orderError } = useQuery<FetchOrderResponse>(
    FETCH_ORDER,
    {
      variables: { id: orderId },
      skip: !orderId,
      fetchPolicy: "network-only",
    }
  );

  const [fetchTierPricing] = useLazyQuery(FETCH_TIER_PRICING, {
    fetchPolicy: "network-only",
  });

  const [updateOrderItems, { loading: updateOrderLoading, error: updateOrderError }] =
    useMutation(UPDATE_ORDER_ITEMS);

  const order = orderData?.fetchOrder;
  const isOrderCancelled =
    order?.status?.toLowerCase() === "cancelled" ||
    order?.status?.toLowerCase() === "canceled" ||
    order?.status?.toLowerCase() === "paid";

  const hasHydratedRef = useRef<string | null>(null);

  // Hydrate order items from fetched order (once per order id)
  useEffect(() => {
    if (!order?.orderItems?.length || !order.id) return;
    if (hasHydratedRef.current === order.id) return;
    hasHydratedRef.current = order.id;

    const mapFetchedToOrderItems = async (): Promise<OrderItem[]> => {
      const items: OrderItem[] = [];
      for (const oi of order.orderItems) {
        const productId = oi.product?.id;
        const variant = oi.product?.variants?.[0];
        const variantId = variant?.shopifyVariantId ?? variant?.id ?? "";
        const originalPrice = variant?.price ?? oi.price ?? 0;

        let hasTierPricing = false;
        let latestMarkedUpPrice: number | null = null;
        let customPrice: number | undefined;

        if (productId) {
          try {
            const { data } = await apolloClient.query<FetchProductResponse>({
              query: FETCH_PRODUCT,
              variables: { id: productId },
              fetchPolicy: "cache-first",
            });
            const p = data?.fetchProduct;
            if (p) {
              hasTierPricing = (p.tierPricing?.length ?? 0) > 0;
              customPrice = p.customPrice ?? undefined;
              const history = p.customPriceChangeHistory ?? [];
              if (history.length) {
                const sorted = [...history].sort(
                  (a, b) =>
                    new Date(b.createdAt ?? 0).getTime() -
                    new Date(a.createdAt ?? 0).getTime()
                );
                const latest = sorted[0]?.customPrice;
                if (latest != null) latestMarkedUpPrice = Number(latest);
              }
            }
          } catch {
            // keep defaults
          }
        }

        items.push({
          product: oi.product?.title ?? "Product",
          productId: productId ?? "",
          variantId,
          quantity: oi.quantity,
          price: oi.price,
          originalPrice,
          customPrice,
          initialPrice: oi.price,
          initialQuantity: oi.quantity,
          hasTierPricing,
          latestMarkedUpPrice,
          orderItemId: oi.id,
        });
      }
      return items;
    };

    void mapFetchedToOrderItems().then(setOrderItems);
  }, [order?.id, apolloClient]); // only run when order id changes; orderItems from server as dependency would re-run on refetch

  const handleAddItem = (values: { product: string; quantity: number; price: number }) => {
    const productId = selectedProductData?.productId;
    if (!productId) {
      showErrorToast("Please select a product");
      return;
    }
    const originalPrice = selectedProductData?.variants?.[0]?.price ?? values.price;
    const variantId = selectedProductData?.variantId ?? selectedProductData?.variants?.[0]?.shopifyVariantId ?? "";

    // Customer order validations: price >= original, price <= latest marked up
    if (values.price < originalPrice) {
      showErrorToast(
        `Price must be greater than or equal to original price ($${originalPrice.toFixed(2)})`
      );
      return;
    }
    if (
      latestMarkedUpPrice !== null &&
      values.price > latestMarkedUpPrice
    ) {
      showErrorToast(
        `Price cannot exceed the latest marked up price ($${latestMarkedUpPrice.toFixed(2)})`
      );
      return;
    }

    const existingIndex = orderItems.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (existingIndex !== -1) {
      const existing = orderItems[existingIndex];
      const newQty = existing.quantity + values.quantity;
      if (selectedProductData?.tierPricing?.length && productId) {
        setOrderItems((prev) => {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], quantity: newQty };
          return next;
        });
        fetchTierPricing({ variables: { productId, quantity: newQty } }).then(({ data }) => {
          if (data?.fetchTierPricing?.tieredPrice != null) {
            setOrderItems((prev) => {
              const next = [...prev];
              if (next[existingIndex]?.productId === productId)
                next[existingIndex] = {
                  ...next[existingIndex],
                  price: Number(data.fetchTierPricing.tieredPrice),
                  initialPrice: Number(data.fetchTierPricing.tieredPrice),
                };
              return next;
            });
          }
        });
        return;
      }
      setOrderItems((prev) => {
        const next = [...prev];
        next[existingIndex] = {
          ...prev[existingIndex],
          quantity: newQty,
        };
        return next;
      });
      return;
    }

    const newItem: OrderItem = {
      product: values.product,
      productId,
      variantId,
      quantity: values.quantity,
      price: values.price,
      originalPrice,
      customPrice: selectedProductData?.customPrice,
      initialPrice: values.price,
      initialQuantity: values.quantity,
      hasTierPricing: (selectedProductData?.tierPricing?.length ?? 0) > 0,
      latestMarkedUpPrice: latestMarkedUpPrice ?? undefined,
      // no orderItemId - new item
    };
    setOrderItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (index: number, field: "quantity" | "price", value: number) => {
    const current = orderItems[index];
    if (!current) return;

    setOrderItems((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], [field]: value };
      return next;
    });

    if (field === "quantity" && current.hasTierPricing && current.productId) {
      lastTierFetchForItemRef.current = { index, quantity: value };
      fetchTierPricing({
        variables: { productId: current.productId, quantity: value },
      }).then(({ data }) => {
        if (data?.fetchTierPricing?.tieredPrice != null) {
          const tieredPrice = Number(data.fetchTierPricing.tieredPrice);
          setOrderItems((prev) => {
            const next = [...prev];
            const item = next[index];
            const last = lastTierFetchForItemRef.current;
            if (!item || !last || last.index !== index || last.quantity !== value) return prev;
            next[index] = { ...item, price: tieredPrice, initialPrice: tieredPrice };
            return next;
          });
        }
      });
    }

    if (field === "price") {
      if (current.originalPrice != null || current.latestMarkedUpPrice != null) {
        let errorMessage: string | null = null;
        if (value < current.originalPrice) {
          errorMessage = `Price must be greater than or equal to original price ($${current.originalPrice.toFixed(2)})`;
        } else if (
          current.latestMarkedUpPrice != null &&
          value > current.latestMarkedUpPrice
        ) {
          errorMessage = `Price cannot exceed the latest marked up price ($${current.latestMarkedUpPrice.toFixed(2)})`;
        }
        if (errorMessage) {
          setPriceErrors((prev) => ({ ...prev, [index]: errorMessage }));
        } else {
          setPriceErrors((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
          });
        }
      } else {
        setPriceErrors((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    }
  };

  const handleDeleteItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
    setPriceErrors((prev) => {
      const next: { [index: number]: string } = {};
      Object.keys(prev).forEach((key) => {
        const i = parseInt(key, 10);
        if (i < index) next[i] = prev[i];
        else if (i > index) next[i - 1] = prev[i];
      });
      return next;
    });
  };

  const totalAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSaveOrder = async () => {
    if (!orderId || orderItems.length === 0) {
      showErrorToast("Add at least one item to the order");
      return;
    }
    if (isOrderCancelled) {
      showErrorToast("Cannot edit a cancelled or paid order");
      return;
    }

    // Customer order validations: each item price >= original, <= latest marked up
    const errors: { [index: number]: string } = {};
    orderItems.forEach((item, index) => {
      if (item.price < item.originalPrice) {
        errors[index] = `Price must be greater than or equal to original price ($${item.originalPrice.toFixed(2)})`;
      } else if (
        item.latestMarkedUpPrice != null &&
        item.price > item.latestMarkedUpPrice
      ) {
        errors[index] = `Price cannot exceed the latest marked up price ($${item.latestMarkedUpPrice.toFixed(2)})`;
      }
    });
    if (Object.keys(errors).length > 0) {
      setPriceErrors(errors);
      showErrorToast("Please fix price errors before saving the order");
      return;
    }

    setPriceErrors({});
    try {
      const orderItemsInput: Array<{
        orderItemId?: string;
        productId?: string;
        variantId?: string;
        quantity?: number;
        price?: number;
      }> = orderItems.map((item) => {
        if (item.orderItemId) {
          const unchanged =
            item.initialQuantity != null &&
            item.quantity === item.initialQuantity &&
            item.price === item.initialPrice;
          if (unchanged) {
            return { orderItemId: item.orderItemId };
          }
          return {
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            price: item.price,
          };
        }
        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        };
      });

      await updateOrderItems({
        variables: {
          orderId,
          subtotal: totalAmount,
          orderItems: orderItemsInput,
        },
      });
      showSuccessToast("Order updated successfully");
      router.push(`/orders/${orderId}`);
    } catch (err) {
      console.error("Error updating order:", err);
      showErrorToast("Failed to update order. Please try again.");
    }
  };

  if (orderLoading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading order...</div>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            {orderError?.message ?? "Order not found"}
          </div>
        </div>
      </div>
    );
  }

  const isCustomerOrder = !!order.patient?.id;
  if (!isCustomerOrder) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">Edit Order</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
          Only customer orders can be edited. This is a clinic order.
        </div>
      </div>
    );
  }

  if (isOrderCancelled) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">Edit Order</h2>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
          This order is cancelled or paid and cannot be edited.
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => router.push(`/orders/${orderId}`)}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Edit Order {order.displayId ?? order.id}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 bg-white rounded-xl">
        {/* Left: Add products */}
        <div className="flex flex-col gap-4 py-4 px-3 md:p-5 xl:p-6 border-e border-gray-200">
          <h2 className="text-black font-medium text-xl">Add products</h2>
          <Formik
            initialValues={{
              product: preservedProduct,
              quantity: 1,
              price: preservedPrice,
            }}
            validationSchema={AddItemSchema}
            enableReinitialize
            onSubmit={(values, { resetForm }) => {
              handleAddItem(values);
              setPreservedProduct("");
              setPreservedPrice(0);
              setSelectedProductData(null);
              resetForm({ values: { product: "", quantity: 1, price: 0 } });
            }}
          >
            {({ values, setFieldValue, setFieldTouched, setFieldError, errors, touched }) => (
              <Form className="flex flex-col gap-4 md:gap-5">
                <ProductSelect
                  fetchMarkedUpProductsOnly={true}
                  selectedProduct={values.product}
                  setSelectedProduct={(product) => {
                    setFieldValue("product", product);
                    setPreservedProduct(product);
                  }}
                  errors={touched.product ? errors.product ?? "" : ""}
                  touched={touched.product}
                  onProductChange={(selectedProduct) => {
                    setSelectedProductData(selectedProduct ?? null);
                    updatePricingInfo(selectedProduct ?? null);
                    if (selectedProduct) {
                      const base =
                        selectedProduct.variants?.[0]?.price ??
                        selectedProduct.originalPrice ??
                        selectedProduct.price ??
                        0;
                      let latestMarkedUp: number | null = null;
                      const ph = selectedProduct.customPriceChangeHistory;
                      if (ph?.length) {
                        const sorted = [...ph].sort(
                          (a, b) =>
                            new Date(b.createdAt ?? 0).getTime() -
                            new Date(a.createdAt ?? 0).getTime()
                        );
                        if (sorted[0]?.customPrice != null)
                          latestMarkedUp = Number(sorted[0].customPrice);
                      }
                      const priceToUse =
                        selectedProduct.customPrice ??
                        latestMarkedUp ??
                        selectedProduct.originalPrice ??
                        base ??
                        0;
                      setPreservedPrice(priceToUse);
                      setFieldValue("price", priceToUse);
                      setPreservedProduct(selectedProduct.name);
                    } else {
                      setPreservedPrice(0);
                      setFieldValue("price", 0);
                    }
                  }}
                />
                {preservedProduct &&
                  (productBasePrice !== null || latestMarkedUpPrice !== null) && (
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
                <div className="flex gap-4 flex-row">
                  <div className="w-full">
                    <Field
                      as={ThemeInput}
                      label="Quantity"
                      name="quantity"
                      placeholder="Quantity"
                      type="number"
                      min="1"
                      step="1"
                      required
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
                      placeholder="Price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
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

        {/* Right: Order items */}
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
                  src="/images/fallbackImages/noItemIllu.svg"
                  alt=""
                  width={720}
                  height={720}
                  className="md:w-40 w-32 h-32 md:h-40"
                  unoptimized
                />
                No items in this order yet. Add products from the left.
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
                    key={`${item.productId}-${item.variantId}-${index}`}
                    className="grid grid-cols-6 sm:gap-0 gap-2 bg-gray-50 items-center py-2 mb-0.5 px-3"
                  >
                    <div className="col-span-6 sm:col-span-2 text-xs md:text-sm">
                      {item.product}
                    </div>
                    <div className="col-span-2 sm:col-auto">
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v >= 1) handleUpdateItem(index, "quantity", v);
                        }}
                        className="rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs"
                      />
                    </div>
                    <div className="col-span-2 sm:col-auto">
                      <input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v) && v > 0) handleUpdateItem(index, "price", v);
                        }}
                        className={`rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs ${
                          priceErrors[index] ? "border-red-500" : ""
                        }`}
                      />
                      {priceErrors[index] && (
                        <p className="text-red-500 text-[12px] mt-0.5">{priceErrors[index]}</p>
                      )}
                    </div>
                    <div className="text-xs md:text-sm whitespace-nowrap">
                      $
                      {(item.quantity * item.price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(index)}
                        className="rounded-md w-8 h-8 flex border bg-white border-gray-200 justify-center hover:bg-red-100 items-center"
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
                      $
                      {totalAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    {updateOrderError && (
                      <p className="text-red-500 text-xs mb-2">
                        {updateOrderError.message}
                      </p>
                    )}
                    <ThemeButton
                      label={updateOrderLoading ? "Saving..." : "Save Order"}
                      onClick={handleSaveOrder}
                      size="medium"
                      icon={<PlusIcon height="18" width="18" />}
                      heightClass="h-10"
                      className="w-full sm:w-fit"
                      disabled={updateOrderLoading || orderItems.length === 0}
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
