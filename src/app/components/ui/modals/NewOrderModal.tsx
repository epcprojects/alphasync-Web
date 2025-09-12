/* eslint-disable @typescript-eslint/no-explicit-any */
// // "use client";
// // import React, { useState } from "react";
// // import AppModal from "./AppModal";
// // import { PlusIcon, ShopingCartIcon, TrashBinIcon } from "@/icons";
// // import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
// // import ThemeInput from "../inputs/ThemeInput";
// // import ThemeButton from "../buttons/ThemeButton";
// // import { Formik, Form, Field } from "formik";
// // import * as Yup from "yup";

// // type DropdownItem = {
// //   name: string;
// //   displayName: string;
// //   email?: string;
// // };

// // interface OrderItem {
// //   product: string;
// //   quantity: number;
// //   price: number;
// // }

// // interface NewOrderModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   customers: DropdownItem[];
// //   products: DropdownItem[];
// //   onCreateOrder: (data: {
// //     customer: string;
// //     items: OrderItem[];
// //     totalAmount: number;
// //   }) => void;
// // }

// // const OrderSchema = Yup.object().shape({
// //   customer: Yup.string().required("Customer is required"),
// //   product: Yup.string().required("Product is required"),
// //   quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
// //   price: Yup.number()
// //     .min(0.01, "Must be greater than 0")
// //     .required("Price is required"),
// // });

// // const NewOrderModal: React.FC<NewOrderModalProps> = ({
// //   isOpen,
// //   onClose,
// //   customers,
// //   products,
// //   onCreateOrder,
// // }) => {
// //   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
// //   const [selectedCustomer, setSelectedCustomer] = useState("");

// //   const handleAddItem = (values: {
// //     customer: string;
// //     product: string;
// //     quantity: number;
// //     price: number;
// //   }) => {
// //     setSelectedCustomer(values.customer);

// //     const newItem: OrderItem = {
// //       product: values.product,
// //       quantity: values.quantity,
// //       price: values.price,
// //     };

// //     setOrderItems((prev) => [...prev, newItem]);
// //   };

// //   const handleUpdateItem = (
// //     index: number,
// //     field: keyof OrderItem,
// //     value: number
// //   ) => {
// //     const updated = [...orderItems];
// //     updated[index] = { ...updated[index], [field]: value };
// //     setOrderItems(updated);
// //   };

// //   const handleDeleteItem = (index: number) => {
// //     setOrderItems((prev) => prev.filter((_, i) => i !== index));
// //   };

// //   const totalAmount = orderItems.reduce(
// //     (acc, item) => acc + item.price * item.quantity,
// //     0
// //   );

// //   const handleCreateOrder = () => {
// //     onCreateOrder({
// //       customer: selectedCustomer,
// //       items: orderItems,
// //       totalAmount,
// //     });
// //     // reset state
// //     setOrderItems([]);
// //     setSelectedCustomer("");
// //     onClose();
// //   };

// //   return (
// //     <AppModal
// //       isOpen={isOpen}
// //       onClose={onClose}
// //       title="Create New Order"
// //       showFooter={false}
// //       size="extraLarge"
// //       icon={<ShopingCartIcon fill="#374151" height={16} width={16} />}
// //       bodyPaddingClasses="p-0"
// //     >
// //       <div className="grid grid-cols-2">
// //         <div className="flex flex-col gap-4 p-5 border-e border-gray-200">
// //           <h2 className="text-black font-medium text-xl">Order Details</h2>

// //           <Formik
// //             initialValues={{
// //               customer: selectedCustomer,
// //               product: "",
// //               quantity: 1,
// //               price: 0,
// //             }}
// //             validationSchema={OrderSchema}
// //             enableReinitialize
// //             onSubmit={(values, { resetForm }) => {
// //               handleAddItem(values);
// //               resetForm({
// //                 values: {
// //                   customer: values.customer,
// //                   product: "",
// //                   quantity: 1,
// //                   price: 0,
// //                 },
// //               });
// //             }}
// //           >
// //             {({ values, setFieldValue, errors, touched }) => (
// //               <Form className="flex flex-col gap-5">
// //                 <div>
// //                   <SelectGroupDropdown
// //                     selectedGroup={values.customer}
// //                     setSelectedGroup={(val: string | string[]) => {
// //                       const v = Array.isArray(val) ? val[0] : val;
// //                       setFieldValue("customer", v);
// //                     }}
// //                     groups={customers}
// //                     errors={errors.customer || ""}
// //                     name="Customer"
// //                     multiple={false}
// //                     placeholder="Select a customer"
// //                     searchTerm={""}
// //                     setSearchTerm={() => {}}
// //                     isShowDrop={true}
// //                     required={true}
// //                     paddingClasses="py-2.5 h-11 px-2"
// //                     optionPaddingClasses="p-1"
// //                     showLabel={true}
// //                     showIcon={false}
// //                   />
// //                   {errors.customer && touched.customer && (
// //                     <p className="text-red-500 text-xs">{errors.customer}</p>
// //                   )}
// //                 </div>
// //                 <div>
// //                   <SelectGroupDropdown
// //                     selectedGroup={values.product}
// //                     setSelectedGroup={(val: string | string[]) => {
// //                       const v = Array.isArray(val) ? val[0] : val;
// //                       setFieldValue("product", v);
// //                     }}
// //                     groups={products}
// //                     errors={errors.product || ""}
// //                     name="Product"
// //                     multiple={false}
// //                     placeholder="Select a product"
// //                     searchTerm={""}
// //                     setSearchTerm={() => {}}
// //                     isShowDrop={true}
// //                     required={true}
// //                     paddingClasses="py-2.5 h-11 px-2"
// //                     optionPaddingClasses="p-1"
// //                     showLabel={true}
// //                     showIcon={false}
// //                   />
// //                   {errors.product && touched.product && (
// //                     <p className="text-red-500 text-xs">{errors.product}</p>
// //                   )}
// //                 </div>

// //                 <div className="flex gap-4">
// //                   <div className="w-full">
// //                     <Field
// //                       as={ThemeInput}
// //                       label="Quantity"
// //                       name="quantity"
// //                       placeholder="Enter quantity"
// //                       type="number"
// //                       id="quantity"
// //                       required={true}
// //                     />
// //                     {errors.quantity && touched.quantity && (
// //                       <p className="text-red-500 text-xs">{errors.quantity}</p>
// //                     )}
// //                   </div>
// //                   <div className="w-full">
// //                     <Field
// //                       as={ThemeInput}
// //                       label="Price ($)"
// //                       name="price"
// //                       placeholder="Enter price"
// //                       type="number"
// //                       id="price"
// //                       required={true}
// //                     />
// //                     {errors.price && touched.price && (
// //                       <p className="text-red-500 text-xs">{errors.price}</p>
// //                     )}
// //                   </div>
// //                 </div>

// //                 <ThemeButton
// //                   label="Add to Order"
// //                   type="submit"
// //                   icon={<PlusIcon />}
// //                   variant="primaryOutline"
// //                 />
// //               </Form>
// //             )}
// //           </Formik>
// //         </div>

// //         <div className="flex flex-col h-full">
// //           <div className="p-4 flex items-center gap-3 border-b border-gray-200">
// //             <h2 className="text-black font-medium text-xl">Order Items</h2>
// //             <span className="bg-blue-50 border rounded-full text-xs py-0.5 px-2.5 border-blue-200 text-blue-700">
// //               {orderItems.length}
// //             </span>
// //           </div>

// //           <div className="h-full">
// //             {orderItems.length === 0 ? (
// //               <div className="flex items-center flex-col gap-4 justify-center h-full text-gray-500">
// //                 No item added to order yet
// //               </div>
// //             ) : (
// //               <>
// //                 <div className="grid grid-cols-6 text-black text-xs font-medium bg-gray-100 py-2 px-3">
// //                   <div className="col-span-2">Product</div>
// //                   <div>Quantity</div>
// //                   <div>Price</div>
// //                   <div>Total</div>
// //                   <div>Actions</div>
// //                 </div>

// //                 {orderItems.map((item, index) => (
// //                   <div
// //                     key={index}
// //                     className="grid grid-cols-6 bg-gray-50 items-center py-2 px-3"
// //                   >
// //                     <div className="col-span-2 text-xs md:text-sm">
// //                       {item.product}
// //                     </div>

// //                     <div>
// //                       <input
// //                         type="number"
// //                         value={item.quantity}
// //                         onChange={(e) =>
// //                           handleUpdateItem(
// //                             index,
// //                             "quantity",
// //                             Number(e.target.value)
// //                           )
// //                         }
// //                         className="rounded-md border border-gray-200 w-full max-w-14 py-0.5 px-2 outline-none text-xs md:text-sm"
// //                       />
// //                     </div>

// //                     <div>
// //                       <input
// //                         type="number"
// //                         value={item.price}
// //                         onChange={(e) =>
// //                           handleUpdateItem(
// //                             index,
// //                             "price",
// //                             Number(e.target.value)
// //                           )
// //                         }
// //                         className="rounded-md border border-gray-200 w-full max-w-14 py-0.5 px-2 outline-none text-xs md:text-sm"
// //                       />
// //                     </div>

// //                     <div className="text-xs md:text-sm whitespace-nowrap">
// //                       ${(item.quantity * item.price).toFixed(2)}
// //                     </div>

// //                     <div>
// //                       <button
// //                         onClick={() => handleDeleteItem(index)}
// //                         className="rounded-md w-8 h-8 flex items-center border border-gray-200 justify-center hover:bg-red-100"
// //                       >
// //                         <TrashBinIcon width="12" height="12" />
// //                       </button>
// //                     </div>
// //                   </div>
// //                 ))}

// //                 <div className="py-2 px-4 flex flex-col gap-2">
// //                   <div className="flex justify-between">
// //                     <span className="text-black text-lg font-semibold">
// //                       Total Amount:
// //                     </span>
// //                     <span className="text-primary text-lg font-semibold">
// //                       ${totalAmount.toFixed(2)}
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-end">
// //                     <ThemeButton
// //                       label="Create Order"
// //                       icon={<PlusIcon />}
// //                       onClick={handleCreateOrder}
// //                       size="small"
// //                       heightClass="h-10"
// //                     />
// //                   </div>
// //                 </div>
// //               </>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </AppModal>
// //   );
// // };

// // export default NewOrderModal;

// "use client";
// import React, { useState } from "react";
// import AppModal from "./AppModal";
// import { PlusIcon, ShopingCartIcon, TrashBinIcon } from "@/icons";
// import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
// import ThemeInput from "../inputs/ThemeInput";
// import ThemeButton from "../buttons/ThemeButton";
// import { Formik, Form, Field } from "formik";
// import * as Yup from "yup";

// type DropdownItem = {
//   name: string;
//   displayName: string;
//   email?: string;
// };

// interface OrderItem {
//   product: string;
//   quantity: number;
//   price: number;
// }

// interface NewOrderModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   customers: DropdownItem[];
//   products: DropdownItem[];
//   onCreateOrder: (data: {
//     customer: string;
//     items: OrderItem[];
//     totalAmount: number;
//   }) => void;
// }

// const OrderSchema = Yup.object().shape({
//   customer: Yup.string().required("Customer is required"),
//   product: Yup.string().required("Product is required"),
//   quantity: Yup.number().min(1, "Minimum 1").required("Quantity is required"),
//   price: Yup.number()
//     .min(0.01, "Must be greater than 0")
//     .required("Price is required"),
// });

// const NewOrderModal: React.FC<NewOrderModalProps> = ({
//   isOpen,
//   onClose,
//   customers,
//   products,
//   onCreateOrder,
// }) => {
//   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
//   const [customerDraft, setCustomerDraft] = useState("");
//   const [lockedCustomer, setLockedCustomer] = useState<string | null>(null);

//   const handleAddItem = (values: {
//     customer: string;
//     product: string;
//     quantity: number;
//     price: number;
//   }) => {
//     // lock on first item
//     if (!lockedCustomer) setLockedCustomer(values.customer);

//     const newItem: OrderItem = {
//       product: values.product,
//       quantity: values.quantity,
//       price: values.price,
//     };

//     setOrderItems((prev) => [...prev, newItem]);
//   };

//   const handleUpdateItem = (
//     index: number,
//     field: keyof OrderItem,
//     value: number
//   ) => {
//     const updated = [...orderItems];
//     updated[index] = { ...updated[index], [field]: value };
//     setOrderItems(updated);
//   };

//   const handleDeleteItem = (index: number) => {
//     setOrderItems((prev) => prev.filter((_, i) => i !== index));
//   };

//   const totalAmount = orderItems.reduce(
//     (acc, item) => acc + item.price * item.quantity,
//     0
//   );

//   const handleCreateOrder = () => {
//     if (orderItems.length === 0) return; // or show a toast

//     const customerForThisOrder = lockedCustomer ?? customerDraft;

//     onCreateOrder({
//       customer: customerForThisOrder,
//       items: orderItems,
//       totalAmount,
//     });

//     // reset state for the next order
//     setOrderItems([]);
//     setCustomerDraft("");
//     setLockedCustomer(null);
//     onClose();
//   };

//   return (
//     <AppModal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Create New Order"
//       showFooter={false}
//       size="extraLarge"
//       icon={<ShopingCartIcon fill="#374151" height={16} width={16} />}
//       bodyPaddingClasses="p-0"
//     >
//       <div className="grid grid-cols-2">
//         <div className="flex flex-col gap-4 p-5 border-e border-gray-200">
//           <h2 className="text-black font-medium text-xl">Order Details</h2>

//           <Formik
//             initialValues={{
//               customer: customerDraft,
//               product: "",
//               quantity: 1,
//               price: 0,
//             }}
//             validationSchema={OrderSchema}
//             enableReinitialize
//             onSubmit={(values, { resetForm }) => {
//               handleAddItem(values);
//               resetForm({
//                 values: {
//                   customer: values.customer,
//                   product: "",
//                   quantity: 1,
//                   price: 0,
//                 },
//               });
//             }}
//           >
//             {({ values, setFieldValue, errors, touched }) => (
//               <Form className="flex flex-col gap-5">
//                 <div>
//                   <SelectGroupDropdown
//                     selectedGroup={values.customer}
//                     // setSelectedGroup={(val: string | string[]) => {
//                     //   const v = Array.isArray(val) ? val[0] : val;
//                     //   setFieldValue("customer", v);
//                     // }}
//                     setSelectedGroup={(val: string | string[]) => {
//                       if (lockedCustomer) return; // prevent changing after first item
//                       const v = Array.isArray(val) ? val[0] : val;
//                       setFieldValue("customer", v);
//                       setCustomerDraft(v);
//                     }}
//                     groups={customers}
//                     errors={errors.customer || ""}
//                     name="Customer"
//                     multiple={false}
//                     placeholder={
//                       lockedCustomer ? "Customer locked" : "Select a customer"
//                     }
//                     isShowDrop={!lockedCustomer} // hide/disable when locked (or use a `disabled` prop if your component supports it)
//                     searchTerm={""}
//                     setSearchTerm={() => {}}
//                     required={true}
//                     paddingClasses="py-2.5 h-11 px-2"
//                     optionPaddingClasses="p-1"
//                     showLabel={true}
//                     showIcon={false}
//                   />
//                   {lockedCustomer && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       Customer locked after adding first item.
//                     </p>
//                   )}
//                   {errors.customer && touched.customer && (
//                     <p className="text-red-500 text-xs">{errors.customer}</p>
//                   )}
//                 </div>
//                 <div>
//                   <SelectGroupDropdown
//                     selectedGroup={values.product}
//                     setSelectedGroup={(val: string | string[]) => {
//                       const v = Array.isArray(val) ? val[0] : val;
//                       setFieldValue("product", v);
//                     }}
//                     groups={products}
//                     errors={errors.product || ""}
//                     name="Product"
//                     multiple={false}
//                     placeholder="Select a product"
//                     searchTerm={""}
//                     setSearchTerm={() => {}}
//                     isShowDrop={true}
//                     required={true}
//                     paddingClasses="py-2.5 h-11 px-2"
//                     optionPaddingClasses="p-1"
//                     showLabel={true}
//                     showIcon={false}
//                   />
//                   {errors.product && touched.product && (
//                     <p className="text-red-500 text-xs">{errors.product}</p>
//                   )}
//                 </div>

//                 <div className="flex gap-4">
//                   <div className="w-full">
//                     <Field
//                       as={ThemeInput}
//                       label="Quantity"
//                       name="quantity"
//                       placeholder="Enter quantity"
//                       type="number"
//                       id="quantity"
//                       required={true}
//                     />
//                     {errors.quantity && touched.quantity && (
//                       <p className="text-red-500 text-xs">{errors.quantity}</p>
//                     )}
//                   </div>
//                   <div className="w-full">
//                     <Field
//                       as={ThemeInput}
//                       label="Price ($)"
//                       name="price"
//                       placeholder="Enter price"
//                       type="number"
//                       id="price"
//                       required={true}
//                     />
//                     {errors.price && touched.price && (
//                       <p className="text-red-500 text-xs">{errors.price}</p>
//                     )}
//                   </div>
//                 </div>

//                 <ThemeButton
//                   label="Add to Order"
//                   type="submit"
//                   icon={<PlusIcon />}
//                   variant="primaryOutline"
//                 />
//               </Form>
//             )}
//           </Formik>
//         </div>

//         <div className="flex flex-col h-full">
//           <div className="p-4 flex items-center gap-3 border-b border-gray-200">
//             <h2 className="text-black font-medium text-xl">Order Items</h2>
//             <span className="bg-blue-50 border rounded-full text-xs py-0.5 px-2.5 border-blue-200 text-blue-700">
//               {orderItems.length}
//             </span>
//           </div>

//           <div className="h-full">
//             {orderItems.length === 0 ? (
//               <div className="flex items-center flex-col gap-4 justify-center h-full text-gray-500">
//                 No item added to order yet
//               </div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-6 text-black text-xs font-medium bg-gray-100 py-2 px-3">
//                   <div className="col-span-2">Product</div>
//                   <div>Quantity</div>
//                   <div>Price</div>
//                   <div>Total</div>
//                   <div>Actions</div>
//                 </div>

//                 {orderItems.map((item, index) => (
//                   <div
//                     key={index}
//                     className="grid grid-cols-6 bg-gray-50 items-center py-2 px-3"
//                   >
//                     <div className="col-span-2 text-xs md:text-sm">
//                       {item.product}
//                     </div>

//                     <div>
//                       <input
//                         type="number"
//                         value={item.quantity}
//                         onChange={(e) =>
//                           handleUpdateItem(
//                             index,
//                             "quantity",
//                             Number(e.target.value)
//                           )
//                         }
//                         className="rounded-md border border-gray-200 w-full max-w-14 py-0.5 px-2 outline-none text-xs md:text-sm"
//                       />
//                     </div>

//                     <div>
//                       <input
//                         type="number"
//                         value={item.price}
//                         onChange={(e) =>
//                           handleUpdateItem(
//                             index,
//                             "price",
//                             Number(e.target.value)
//                           )
//                         }
//                         className="rounded-md border border-gray-200 w-full max-w-14 py-0.5 px-2 outline-none text-xs md:text-sm"
//                       />
//                     </div>

//                     <div className="text-xs md:text-sm whitespace-nowrap">
//                       ${(item.quantity * item.price).toFixed(2)}
//                     </div>

//                     <div>
//                       <button
//                         onClick={() => handleDeleteItem(index)}
//                         className="rounded-md w-8 h-8 flex items-center border border-gray-200 justify-center hover:bg-red-100"
//                       >
//                         <TrashBinIcon width="12" height="12" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}

//                 <div className="py-2 px-4 flex flex-col gap-2">
//                   <div className="flex justify-between">
//                     <span className="text-black text-lg font-semibold">
//                       Total Amount:
//                     </span>
//                     <span className="text-primary text-lg font-semibold">
//                       ${totalAmount.toFixed(2)}
//                     </span>
//                   </div>
//                   <div className="flex justify-end">
//                     <ThemeButton
//                       label="Create Order"
//                       icon={<PlusIcon />}
//                       onClick={handleCreateOrder}
//                       size="small"
//                       heightClass="h-10"
//                     />
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </AppModal>
//   );
// };

// export default NewOrderModal;

"use client";
import React, { useState } from "react";
import AppModal from "./AppModal";
import { PlusIcon, ShopingCartIcon, TrashBinIcon } from "@/icons";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import ThemeInput from "../inputs/ThemeInput";
import ThemeButton from "../buttons/ThemeButton";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

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

interface DraftOrder {
  id: string;
  customer: string;
  items: OrderItem[];
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: DropdownItem[];
  products: DropdownItem[];
  onCreateOrder: (data: {
    customer: string;
    items: OrderItem[];
    totalAmount: number;
  }) => void;
}

const OrderSchema = Yup.object().shape({
  customer: Yup.string().required("Customer is required"),
  product: Yup.string().required("Product is required"),
  quantity: Yup.number()
    .typeError("Quantity must be a number")
    .min(1, "Minimum 1")
    .required("Quantity is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .min(0.01, "Must be greater than 0")
    .required("Price is required"),
});

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  customers,
  products,
  onCreateOrder,
}) => {
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [customerDraft, setCustomerDraft] = useState("");

  const customerLabel = (name: string) =>
    customers.find((c) => c.name === name)?.displayName || name || "—";

  const handleAddItem = (values: {
    customer: string;
    product: string;
    quantity: number;
    price: number;
  }) => {
    const newItem: OrderItem = {
      product: values.product,
      quantity: values.quantity,
      price: values.price,
    };

    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.customer === values.customer);
      if (idx === -1) {
        return [
          ...prev,
          {
            id: uid(),
            customer: values.customer,
            items: [newItem],
          },
        ];
      }
      const copy = [...prev];
      copy[idx] = { ...copy[idx], items: [...copy[idx].items, newItem] };
      return copy;
    });
  };

  const handleUpdateItem = (
    draftId: string,
    itemIndex: number,
    field: keyof OrderItem,
    value: number
  ) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id !== draftId
          ? d
          : {
              ...d,
              items: d.items.map((it, i) =>
                i === itemIndex ? { ...it, [field]: value } : it
              ),
            }
      )
    );
  };

  const handleDeleteItem = (draftId: string, itemIndex: number) => {
    setDrafts((prev) =>
      prev
        .map((d) =>
          d.id !== draftId
            ? d
            : { ...d, items: d.items.filter((_, i) => i !== itemIndex) }
        )
        .filter((d) => d.items.length > 0)
    );
  };
  const getTotal = (d: DraftOrder) =>
    d.items.reduce(
      (acc, item) =>
        acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0
    );

  //   const handleCreateOneOrder = (draftId: string) => {
  //     const target = drafts.find((d) => d.id === draftId);
  //     if (!target || target.items.length === 0 || !target.customer) return;

  //     onCreateOrder({
  //       customer: target.customer,
  //       items: target.items,
  //       totalAmount: getTotal(target),
  //     });
  //     setDrafts((prev) => prev.filter((d) => d.id !== draftId));
  //   };

  const handleCreateAll = () => {
    if (drafts.length === 0) return;
    drafts.forEach((d) => {
      onCreateOrder({
        customer: d.customer,
        items: d.items,
        totalAmount: getTotal(d),
      });
    });
    setDrafts([]);
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      showFooter={false}
      size="extraLarge"
      icon={<ShopingCartIcon fill="#374151" height={16} width={16} />}
      bodyPaddingClasses="p-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col gap-4 p-5 border-e border-gray-200">
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
                <div>
                  <SelectGroupDropdown
                    selectedGroup={values.customer}
                    setSelectedGroup={(val: string | string[]) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setFieldValue("customer", v);
                      setCustomerDraft(v);
                    }}
                    groups={customers}
                    errors={errors.customer || ""}
                    name="Customer"
                    multiple={false}
                    placeholder="Select a customer"
                    searchTerm={""}
                    setSearchTerm={() => {}}
                    isShowDrop={true}
                    required={true}
                    paddingClasses="py-2.5 h-11 px-2"
                    optionPaddingClasses="p-1"
                    showLabel={true}
                    showIcon={false}
                  />
                  {errors.customer && touched.customer && (
                    <p className="text-red-500 text-xs">{errors.customer}</p>
                  )}
                </div>

                <div>
                  <SelectGroupDropdown
                    selectedGroup={values.product}
                    setSelectedGroup={(val: string | string[]) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setFieldValue("product", v);
                    }}
                    groups={products}
                    errors={errors.product || ""}
                    name="Product"
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

                <div className="flex gap-4">
                  <div className="w-full">
                    <Field name="quantity">
                      {({ field, meta }: any) => (
                        <>
                          <ThemeInput
                            {...field}
                            label="Quantity"
                            placeholder="Enter quantity"
                            type="number"
                            id="quantity"
                            required
                            min={1}
                            step={1}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const num = Number(e.target.value);
                              field.onChange({
                                target: {
                                  name: field.name,
                                  value: Number.isFinite(num) ? num : "",
                                },
                              });
                            }}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-red-500 text-xs">{meta.error}</p>
                          )}
                        </>
                      )}
                    </Field>
                  </div>

                  <div className="w-full">
                    <Field name="price">
                      {({ field, meta }: any) => (
                        <>
                          <ThemeInput
                            {...field}
                            label="Price ($)"
                            placeholder="Enter price"
                            type="number"
                            id="price"
                            required
                            min={0.01}
                            step={0.01}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const num = Number(e.target.value);
                              field.onChange({
                                target: {
                                  name: field.name,
                                  value: Number.isFinite(num) ? num : "",
                                },
                              });
                            }}
                          />
                          {meta.touched && meta.error && (
                            <p className="text-red-500 text-xs">{meta.error}</p>
                          )}
                        </>
                      )}
                    </Field>
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
              {drafts.length}
            </span>

            <div className="ml-auto">
              <ThemeButton
                label="Create Order"
                onClick={handleCreateAll}
                size="small"
                heightClass="h-9"
                disabled={drafts.length === 0}
              />
            </div>
          </div>

          <div className=" overflow-y-auto h-[340px]">
            {drafts.length === 0 ? (
              <div className="flex items-center flex-col gap-4 justify-center h-full text-gray-500">
                No drafts yet. Add items to start a draft.
              </div>
            ) : (
              drafts.map((draft) => {
                const total = getTotal(draft);
                return (
                  <div key={draft.id} className="border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-black">
                          {customerLabel(draft.customer)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({draft.items.length} Order
                          {draft.items.length !== 1 ? "s" : ""})
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-500 mr-1">Total:</span>
                          <span className="font-semibold text-primary">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                        {/* <ThemeButton
                          label="Create Order"
                          icon={<PlusIcon />}
                          onClick={() => handleCreateOneOrder(draft.id)}
                          size="small"
                          heightClass="h-9"
                          disabled={draft.items.length === 0}
                        /> */}
                      </div>
                    </div>

                    {/* header */}
                    <div className="grid grid-cols-6 text-black text-xs font-medium bg-gray-100 py-2 px-3">
                      <div className="col-span-2">Product</div>
                      <div>Quantity</div>
                      <div>Price</div>
                      <div>Total</div>
                      <div>Actions</div>
                    </div>

                    {/* items */}
                    {draft.items.map((item, index) => (
                      <div
                        key={`${draft.id}-${index}`}
                        className="grid grid-cols-6 bg-white items-center py-2 px-3"
                      >
                        <div className="col-span-2 text-xs md:text-sm">
                          {item.product}
                        </div>

                        <div>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(
                                draft.id,
                                index,
                                "quantity",
                                Number.isFinite(Number(e.target.value))
                                  ? Number(e.target.value)
                                  : 0
                              )
                            }
                            className="rounded-md border border-gray-200 w-full max-w-14 py-0.5 px-2 outline-none text-xs md:text-sm"
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            min={0.01}
                            step={0.01}
                            value={item.price}
                            onChange={(e) =>
                              handleUpdateItem(
                                draft.id,
                                index,
                                "price",
                                Number.isFinite(Number(e.target.value))
                                  ? Number(e.target.value)
                                  : 0
                              )
                            }
                            className="rounded-md border border-gray-200 w-full max-w-14 py-0.5 px-2 outline-none text-xs md:text-sm"
                          />
                        </div>

                        <div className="text-xs md:text-sm whitespace-nowrap">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>

                        <div>
                          <button
                            onClick={() => handleDeleteItem(draft.id, index)}
                            className="rounded-md w-8 h-8 flex items-center border border-gray-200 justify-center hover:bg-red-100"
                            aria-label="Delete item"
                          >
                            <TrashBinIcon width="12" height="12" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default NewOrderModal;
