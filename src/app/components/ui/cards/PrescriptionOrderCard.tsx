import React from "react";
import ThemeButton from "../buttons/ThemeButton";
import { MedicineIcon, TrashBinIcon } from "@/icons";

interface OrderItem {
  id: string;
  medicineName: string;
  quantity: number;
  price: number;
  amount: string;
}

export interface PrescriptionOrder {
  id: string;
  orderNumber: string;
  doctorName: string;
  orderItems: OrderItem[];
  orderedOn: string;
  totalPrice: number;
  isDueToday?: string;
}

interface PrescriptionOrderCardProps {
  orders?: PrescriptionOrder[];
  onDelete?: () => void;
  onPress?: (order: PrescriptionOrder) => void;
  onPay: () => void;
}

const PrescriptionOrderCard: React.FC<PrescriptionOrderCardProps> = ({
  orders,
  onDelete,
  onPress,
  onPay,
}) => {
  const getOrderTags = (status?: string) => {
    switch (status) {
      case "Due Today":
        return "bg-red-50 border border-red-200 text-red-700";
      default:
        return "bg-green-50 border border-green-200 text-green-700";
    }
  };

  return (
    <div className="flex flex-col gap-4 cursor-pointer">
      {orders?.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] border border-gray-200 p-4 2xl:p-6 
          w-full max-w-7xl"
          onClick={() => onPress && onPress(order)}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-950">
              Order #{order.orderNumber}
            </h2>
            <span
              className={`${getOrderTags(
                order.isDueToday
              )} px-3 py-0.5 rounded-full text-sm font-medium whitespace-nowrap`}
            >
              {order.isDueToday}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-4 md:mt-0 mb-2">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              <p className="text-sm font-normal text-gray-800">
                Prescribing Doctor
              </p>
              <p className="text-sm font-semibold text-gray-800 text-right md:text-left">
                {order.doctorName}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              <p className="text-sm font-normal text-gray-800">Order Items</p>
              <p className="text-sm font-semibold text-gray-800 rounded-b-sm text-right md:text-left">
                {String(order.orderItems.length).padStart(2, "0")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
              <p className="text-sm font-normal text-gray-800">Ordered on</p>
              <p className="text-sm font-semibold text-gray-800 text-right md:text-left">
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
                    <MedicineIcon />
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
                    x{item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {/* don't remove this code for now  */}
          {/* <div className="flex items-center justify-between [@media(min-width:450px)]:justify-end w-full">
            <div className="flex items-center space-x-2 w-full [@media(min-width:450px)]:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-11 h-11 hover:bg-red-50 cursor-pointer rounded-full flex items-center justify-center border border-red-200"
              >
                <TrashBinIcon />
              </button>
              <ThemeButton
                variant="outline"
                label="Pay Now"
                onClick={(e) => {
                  e.stopPropagation();
                  onPay?.();
                }}
                className="flex-1 [@media(min-width:450px)]:flex-none min-w-32"
                heightClass="h-11"
              />

              <span className="text-xl font-semibold text-primary text-right [@media(min-width:450px)]:text-left">
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div> */}
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center space-x-2 w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="w-11 h-11 hover:bg-red-50 cursor-pointer rounded-full flex items-center justify-center border border-red-200"
              >
                <TrashBinIcon />
              </button>

              <ThemeButton
                variant="outline"
                label="Pay Now"
                onClick={(e) => {
                  e.stopPropagation();
                  onPay?.();
                }}
                className="flex-none min-w-32"
                heightClass="h-11"
              />

              <span className="text-xl font-semibold text-primary text-left">
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
