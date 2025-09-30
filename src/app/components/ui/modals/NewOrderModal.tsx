"use client";
import React, { useState } from "react";
import AppModal from "./AppModal";
import { PlusIcon, ShopingCartIcon, TrashBinIcon } from "@/icons";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import ThemeInput from "../inputs/ThemeInput";
import ThemeButton from "../buttons/ThemeButton";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { showSuccessToast } from "@/lib/toast";
import { formatNumber } from "@/lib/helpers";

type DropdownItem = {
  name: string;
  displayName: string;
  email?: string;
};

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer?: DropdownItem;
  customers: DropdownItem[];
  products: DropdownItem[];
  onCreateOrder: (data: {
    customer: string;
    items: OrderItem[];
    totalAmount: number;
  }) => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  customers,
  products,
  onCreateOrder,
}) => {
  const OrderSchema = Yup.object().shape({
    customer: currentCustomer
      ? Yup.string().optional() // if parent already provides customer
      : Yup.string().required("Customer is required"),
    product: Yup.string().required("Product is required"),
    quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
    price: Yup.number()
      .min(0.01, "Must be greater than 0")
      .required("Price is required"),
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerDraft, setCustomerDraft] = useState("");
  const [lockedCustomer, setLockedCustomer] = useState<string | null>(
    currentCustomer?.displayName || null
  );

  const handleAddItem = (values: {
    customer: string;
    product: string;
    quantity: number;
    price: number;
  }) => {
    // lock on first item
    if (!lockedCustomer) setLockedCustomer(values.customer);

    const newItem: OrderItem = {
      product: values.product,
      quantity: values.quantity,
      price: values.price,
    };

    setOrderItems((prev) => [...prev, newItem]);
    showSuccessToast("Order created successfully");
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

  const handleCreateOrder = () => {
    if (orderItems.length === 0) return; // or show a toast

    const customerForThisOrder = lockedCustomer ?? customerDraft;

    onCreateOrder({
      customer: customerForThisOrder,
      items: orderItems,
      totalAmount,
    });

    // reset state for the next order
    setOrderItems([]);
    setCustomerDraft("");
    if (!currentCustomer) {
      setLockedCustomer(null);
    }
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      showFooter={false}
      size="extraLarge"
      outSideClickClose={false}
      icon={<ShopingCartIcon fill="#374151" height={16} width={16} />}
      bodyPaddingClasses="p-0"
    >
      <div className="grid grid-cols-2">
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
                        lockedCustomer ? "Customer locked" : "Select a customer"
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
                      <p className="text-red-500 text-xs">{errors.customer}</p>
                    )}
                  </div>
                )}
                <div>
                  <SelectGroupDropdown
                    selectedGroup={values.product}
                    setSelectedGroup={(val: string | string[]) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setFieldValue("product", v);
                    }}
                    groups={products}
                    errors={errors.product || ""}
                    name="Product:"
                    multiple={false}
                    placeholder="Select a product"
                    searchTerm={""}
                    setSearchTerm={() => {}}
                    isShowDrop={true}
                    required={true}
                    paddingClasses="py-2.5 h-11 px-2"
                    optionPaddingClasses="p-1"
                    showLabel={true}
                    showIcon={false}
                  />
                  {errors.product && touched.product && (
                    <p className="text-red-500 text-xs">{errors.product}</p>
                  )}
                </div>

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
                        className="rounded-md border bg-white border-gray-200 w-full max-w-14 py-0.5 h-7 px-2 outline-none text-xs "
                      />
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
                    <ThemeButton
                      label="Create Order"
                      icon={<PlusIcon height="18" width="18" />}
                      onClick={handleCreateOrder}
                      size="medium"
                      heightClass="h-10"
                      // disabled={true}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default NewOrderModal;
