"use client";
import React, { useState } from "react";
import { ArrowDownIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { SelectGroupDropdown } from "@/app/components";
import { ThemeInput, ThemeButton } from "@/app/components";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { formatNumber } from "@/lib/helpers";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_PATIENTS, ALL_PRODUCTS } from "@/lib/graphql/queries";
import { CREATE_ORDER } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";

interface OrderItem {
  product: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

// Interface for GraphQL response
interface AllPatientsResponse {
  allPatients: {
    allData: UserAttributes[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

interface AllProductsResponse {
  allProducts: {
    allData: {
      id: string;
      title: string;
      variants: {
        id: string;
        shopifyVariantId: string;
        price: number;
      }[];
    }[];
  };
}

const Page = () => {
  const router = useRouter();
  const OrderSchema = Yup.object().shape({
    customer: Yup.string().required("Customer is required"),
    product: Yup.string().required("Product is required"),
    quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
    price: Yup.number()
      .min(0.01, "Must be greater than 0")
      .required("Price is required"),
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerDraft, setCustomerDraft] = useState("");
  const [lockedCustomer, setLockedCustomer] = useState<string | null>(null);

  // GraphQL query to fetch customers
  const {
    data,
    loading: customersLoading,
    error: customersError,
  } = useQuery<AllPatientsResponse>(ALL_PATIENTS, {
    variables: {
      search: "",
      status: "ACTIVE", // Only fetch active customers
      page: 1,
      perPage: 100, // Fetch more customers for dropdown
    },
    fetchPolicy: "network-only",
  });

  // GraphQL query to fetch products
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<AllProductsResponse>(ALL_PRODUCTS, {
    fetchPolicy: "network-only",
  });

  // GraphQL mutation to create order
  const [
    createOrder,
    { loading: createOrderLoading, error: createOrderError },
  ] = useMutation(CREATE_ORDER);

  const handleAddItem = (values: {
    customer: string;
    product: string;
    quantity: number;
    price: number;
  }) => {
    // lock on first item
    if (!lockedCustomer) setLockedCustomer(values.customer);

    const selectedProduct = products.find((p) => p.name === values.product);

    const newItem: OrderItem = {
      product: values.product,
      productId: selectedProduct?.productId || "",
      variantId: selectedProduct?.variantId || "",
      quantity: values.quantity,
      price: values.price,
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
  };

  const handleDeleteItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) return;

    try {
      // Find the selected customer
      const selectedCustomer = customers.find((c) => c.name === lockedCustomer);
      if (!selectedCustomer) {
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

      console.log("Creating order with items:", orderItemsInput);
      console.log("Mutation variables:", {
        orderItems: orderItemsInput,
        totalPrice: totalAmount,
        patientId: selectedCustomer.id,
      });

      await createOrder({
        variables: {
          orderItems: orderItemsInput,
          totalPrice: totalAmount,
          patientId: selectedCustomer.id,
        },
      });

      // Reset form state
      setLockedCustomer(null);
      setOrderItems([]);
      setCustomerDraft("");
      showSuccessToast("Order created successfully");
    } catch (error) {
      console.error("Error creating order:", error);
      showErrorToast("Failed to create order. Please try again.");
    }
  };

  // Transform GraphQL customer data to match dropdown format
  const customers =
    data?.allPatients.allData?.map((patient: UserAttributes) => ({
      name: patient.fullName || patient.email || `Patient ${patient.id}`,
      displayName: patient.fullName || patient.email || `Patient ${patient.id}`,
      email: patient.email,
      id: patient.id, // Include patient ID for mutation
    })) || [];

  // Transform GraphQL product data to match dropdown format
  const products =
    productsData?.allProducts.allData?.map((product) => {
      const firstVariant = product.variants?.[0];

      return {
        name: product.title,
        displayName: product.title,
        productId: product.id,
        variantId: firstVariant?.shopifyVariantId,
        price: firstVariant?.price,
      };
    }) || [];

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
              <Form className="flex flex-col gap-4 md:gap-5">
                <div>
                  {customersError && (
                    <p className="text-red-500 text-xs mb-2">
                      Error loading customers: {customersError.message}
                    </p>
                  )}
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
                      customersLoading
                        ? "Loading customers..."
                        : lockedCustomer
                        ? "Customer locked"
                        : customers.length === 0
                        ? "No customers available"
                        : "Select a customer"
                    }
                    isShowDrop={!lockedCustomer && !customersLoading}
                    searchTerm={""}
                    setSearchTerm={() => {}}
                    required={true}
                    paddingClasses="py-2.5 h-11 px-2"
                    optionPaddingClasses="p-1"
                    showLabel={true}
                    showIcon={false}
                    disabled={!!lockedCustomer || customersLoading}
                  />
                  {errors.customer && touched.customer && (
                    <p className="text-red-500 text-xs">{errors.customer}</p>
                  )}
                </div>
                <div>
                  {productsError && (
                    <p className="text-red-500 text-xs mb-2">
                      Error loading products: {productsError.message}
                    </p>
                  )}
                  <SelectGroupDropdown
                    selectedGroup={values.product}
                    setSelectedGroup={(val: string | string[]) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setFieldValue("product", v);

                      // Auto-populate price when product is selected
                      if (v) {
                        const selectedProduct = products.find(
                          (p) => p.name === v
                        );
                        if (selectedProduct && selectedProduct.price) {
                          setFieldValue("price", selectedProduct.price);
                        }
                      }
                    }}
                    groups={products}
                    errors={errors.product || ""}
                    name="Product:"
                    multiple={false}
                    placeholder={
                      productsLoading
                        ? "Loading products..."
                        : products.length === 0
                        ? "No products available"
                        : "Select a product"
                    }
                    searchTerm={""}
                    setSearchTerm={() => {}}
                    isShowDrop={!productsLoading}
                    required={true}
                    paddingClasses="py-2.5 h-11 px-2"
                    optionPaddingClasses="p-1"
                    showLabel={true}
                    showIcon={false}
                    disabled={productsLoading}
                  />
                  {errors.product && touched.product && (
                    <p className="text-red-500 text-xs">{errors.product}</p>
                  )}
                </div>

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
                />
                No item added to order yet
              </div>
            ) : (
              <>
                <div className="grid grid-cols-6 text-black text-xs font-medium bg-gray-100 py-2 px-3">
                  <div className="col-span-2">Product</div>
                  <div>Quantity</div>
                  <div>Price</div>
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
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 px-2 h-7 outline-none text-xs"
                      />
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
