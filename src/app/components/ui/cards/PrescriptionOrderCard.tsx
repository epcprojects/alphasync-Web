import React from "react";
import MedicineIcon from "../../../../../public/icons/MedicineIcon";
import { Trash, TrashBinIcon } from "@/icons";

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
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 max-w-7xl"
        >
          <div className="flex items-center justify-between mb-6">
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
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div>
              <p className="text-sm font-normal text-Gray-800">
                Prescribing Doctor
              </p>
              <p className="text-sm font-semibold text-Gray-800">
                {order.doctorName}
              </p>
            </div>
            <div>
              <p className="text-sm font-normal text-Gray-800">Order Items</p>
              <p className="text-sm font-semibold text-Gray-800">
                {String(order.orderItems.length).padStart(2, "0")}
              </p>
            </div>
            <div>
              <p className="text-sm font-normal text-Gray-800">Ordered on</p>
              <p className="text-sm font-semibold text-Gray-800">
                {order.orderedOn}
              </p>
            </div>
          </div>
          <div className="gap-2 mb-5">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg mb-2"
              >
                <div className="flex items-center">
                  <MedicineIcon />
                  <span className="text-sm font-normal text-Gray-800 ml-2">
                    {item.medicineName}
                  </span>
                </div>
                <div className="flex items-center space-x-6">
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
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <Trash />
              <button className="text-gray-700 px-8 py-2.5 rounded-4xl font-semibold border border-gray-300  ">
                Pay Now
              </button>
              <span className="text-xl font-semibold text-primary">
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
