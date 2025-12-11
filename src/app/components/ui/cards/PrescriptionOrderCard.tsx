import React from "react";
import ThemeButton from "../buttons/ThemeButton";
import { MedicineIcon, Reload } from "@/icons";
import ProductImage from "@/app/components/ui/ProductImage";

export type pageVarient = "order" | "Pending-page";

interface OrderItem {
  id: string;
  medicineName: string;
  quantity: number;
  price: number;
  amount: string;
  description?: string;
  imageUrl?: string;

  product?: {
    primaryImage?: string;
  };
}

export interface PrescriptionOrder {
  id: string;
  displayId: string;
  doctorName: string;
  orderItems: OrderItem[];
  orderedOn: string;
  totalPrice: number;
  isDueToday?: string;
  status?: string;
  shippingAddress?: string;
  patient?: {
    address?: string | null;
  };
}

interface PrescriptionOrderCardProps {
  orders?: PrescriptionOrder[];
  onDelete?: () => void;
  onPress?: (order: PrescriptionOrder) => void;
  onPay?: (order: PrescriptionOrder) => void;
  btnTitle: string;
  icon: React.ReactNode;
  type: pageVarient;
  btnDisabled?: boolean;
}

const PrescriptionOrderCard: React.FC<PrescriptionOrderCardProps> = ({
  orders,
  onDelete,
  onPress,
  onPay,
  btnTitle,
  icon,
  type = "order",
  btnDisabled,
}) => {
  const getOrderTags = (status?: string) => {
    switch (status) {
      case "Due Today":
        return "bg-red-50 border border-red-200 text-red-700";
      case "pending_payment":
        return "bg-amber-50 border border-amber-200 text-amber-700";
      case "Ready for Pickup":
        return "bg-blue-50 border border-blue-200 text-blue-700";
      default:
        return "bg-green-50 border border-green-200 text-green-700";
    }
  };

  return (
    <div className="flex flex-col gap-4 cursor-pointer">
      {orders?.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-table border border-gray-200 p-4 2xl:p-6 
          w-full max-w-7xl"
          onClick={() => onPress && onPress(order)}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-950">
              {order.displayId}
            </h2>
            <span
              className={` capitalize ${getOrderTags(
                order.status
              )} px-3 py-0.5 rounded-full text-sm font-medium whitespace-nowrap`}
            >
              {order.status === "pending_payment"
                ? "Pending Payment"
                : order.status}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 mt-4 md:mt-0 mb-2">
            <div className="flex justify-between md:flex-col md:gap-1">
              <p className="text-sm font-normal text-gray-800">
                Prescribing Doctor
              </p>
              <p className="text-sm font-semibold text-gray-800 md:text-left">
                {order.doctorName}
              </p>
            </div>

            <div className="flex justify-between md:flex-col md:gap-1">
              <p className="text-sm font-normal text-gray-800">Order Items</p>
              <p className="text-sm font-semibold text-gray-800 md:text-left">
                {String(order.orderItems.length).padStart(2, "0")}
              </p>
            </div>

            <div className="flex justify-between md:flex-col md:gap-1">
              <p className="text-sm font-normal text-gray-800">Ordered on</p>
              <p className="text-sm font-semibold text-gray-800 md:text-left">
                {order.orderedOn}
              </p>
            </div>
          </div>
          <div className="gap-2 mb-3">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-100 pl-1 pr-2 py-1 rounded-lg mb-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    {/* <MedicineIcon /> */}
                    <ProductImage
                      alt="prduct"
                      src={item?.product?.primaryImage}
                      width={1024}
                      height={1024}
                      className="w-full h-full border rounded-lg border-gray-200"
                    />
                  </div>
                  <span
                    className="
            text-sm font-normal text-gray-800 ml-2
            line-clamp-2 overflow-hidden text-ellipsis
          "
                  >
                    {item.medicineName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-white rounded-xs px-1.5 text-sm font-medium text-gray-600">
                    Quantity - {item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto sm:justify-end justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (type === "Pending-page") {
                    onDelete?.();
                  } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    onPress && onPress(order);
                  }
                }}
                className={`w-11 h-11 ${
                  type === "Pending-page"
                    ? "hover:bg-red-50"
                    : "hover:bg-gray-50"
                } cursor-pointer rounded-full flex items-center justify-center border ${
                  type === "Pending-page"
                    ? "border-red-200"
                    : "border-lightGray"
                }`}
              >
                {icon}
              </button>
              <ThemeButton
                variant="outline"
                label={btnTitle}
                disabled={btnDisabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onPay?.(order);
                }}
                className="flex-1 sm:flex-none sm:min-w-32"
                heightClass="h-11"
                icon={type === "order" && <Reload />}
              />
              <span className="text-xl font-semibold text-primary text-left sm:text-right">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrescriptionOrderCard;
