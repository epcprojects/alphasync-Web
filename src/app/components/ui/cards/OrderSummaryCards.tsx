import React from "react";
import Image from "next/image";

interface OrderSummaryItem {
  id: string | number;
  medicineName: string;
  amount: string;
  quantity: number;
  price: number;
}

interface OrderItemCardProps {
  item: OrderSummaryItem;
}

const OrderSummaryCard: React.FC<OrderItemCardProps> = ({ item }) => {
  return (
    <div key={item.id} className="px-4 pt-4">
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg flex items-center justify-center">
          <Image
            alt="#"
            src={"/images/products/p1.png"}
            width={1024}
            height={1024}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3 md:gap-1.5">
          <h3 className=" text-gray-800 font-semibold text-base">
            {item.medicineName}
          </h3>
          <p className="text-sm font-normal text-gray-800 hidden md:block">
            A synthetic peptide known for its healing properties. BPC-157 promotes
            tissue...
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 mb-1.5">
              <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Recovery & Healing
              </p>
            </div>
            <p className="text-xs font-normal text-gray-800">{item.amount}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2 md:mt-0">
        <div className="flex justify-between">
          <span className="text-xs font-normal text-gray-800">Quantity</span>
          <span className="text-xs font-medium text-gray-800">
            {String(item.quantity).padStart(2, "0")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-normal text-gray-800">Price</span>
          <span className="text-xs font-medium text-gray-800">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-base font-medium text-gray-800">Total</span>
          <span className="text-base font-semibold text-primary">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      <hr className=" text-gray-200 mt-3" />
    </div>
  );
};

export default OrderSummaryCard;
