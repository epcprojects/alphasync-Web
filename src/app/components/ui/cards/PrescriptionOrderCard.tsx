import React from "react";
import MedicineIcon from "../../../../../public/icons/MedicineIcon";
import ThemeButton from "../buttons/ThemeButton";
import { TrashBinIcon } from "@/icons";

interface OrderItem {
  id: string;
  medicineName: string;
  quantity: number;
  price: number;
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
  onDelete?: (orderId: string) => void;
}

const PrescriptionOrderCard: React.FC<PrescriptionOrderCardProps> = ({
  orders,
  onDelete,
}) => {
  return (
    <div className="space-y-4 mx-6 2xl:mx-0">
      {orders?.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] border border-gray-200 p-4 2xl:p-6 
          w-full max-w-7xl"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-950">
              Order #{order.orderNumber}
            </h2>
            <span
              className={`${
                order.isDueToday === "Due Today"
                  ? `bg-utility-error-50`
                  : "bg-success-50"
              } border ${
                order.isDueToday === "Due Today"
                  ? "border-utility-error-200"
                  : "border-success-200"
              } ${
                order.isDueToday === "Due Today"
                  ? "text-utility-error-700"
                  : "text-success-500"
              } px-3 py-1 rounded-full text-sm font-medium`}
            >
              {order.isDueToday}
            </span>
          </div>
          <div className="flex flex-col mt-4 md:mt-0 md:flex-row md:grid md:grid-cols-3 md:gap-8 gap-4 mb-2">
            <div className="flex justify-between  md:flex-col">
              <p className="text-sm font-normal text-Gray-800">
                Prescribing Doctor
              </p>
              <p className="text-sm font-semibold text-Gray-800">
                {order.doctorName}
              </p>
            </div>
            <div className="flex justify-between md:flex-col">
              <p className="text-sm font-normal text-Gray-800">Order Items</p>
              <p className="text-sm font-semibold text-Gray-800">
                {String(order.orderItems.length).padStart(2, "0")}
              </p>
            </div>
            <div className="flex justify-between md:flex-col">
              <p className="text-sm font-normal text-Gray-800">Ordered on</p>
              <p className="text-sm font-semibold text-Gray-800">
                {order.orderedOn}
              </p>
            </div>
          </div>
          <div className="gap-2 mb-3">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-100 pl-1 pr-2 py-1 md:py-2 rounded-lg mb-2"
              >
                <div className="flex items-center w-[70%]">
                  <div className="flex-shrink-0 w-[42px] h-[42px] flex items-center justify-center">
                    <MedicineIcon className="w-[42px] h-[42px]" />
                  </div>
                  <span
                    className="
            text-sm font-normal text-Gray-800 ml-2
            line-clamp-2 overflow-hidden text-ellipsis
          "
                  >
                    {item.medicineName}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
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
          <div className="flex items-center justify-between [@media(min-width:450px)]:justify-end w-full">
            <div className="flex items-center space-x-2 w-full [@media(min-width:450px)]:w-auto">
              <button className="w-11 h-11 hover:bg-red-50 cursor-pointer rounded-full flex items-center justify-center hover:border border-red-200">
                <TrashBinIcon />
              </button>

              <ThemeButton
                variant="outline"
                label="Pay Now"
                onClick={() => {}}
                className="flex-1 [@media(min-width:450px)]:flex-none min-w-32"
                heightClass="h-11"
              />

              <span className="text-xl font-semibold text-primary text-right [@media(min-width:450px)]:text-left">
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
