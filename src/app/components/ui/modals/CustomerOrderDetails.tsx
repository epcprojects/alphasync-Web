import { AlphaSyncMed } from "@/icons";
import OrderDetail from "../../../../../public/icons/OrdeerDetail";
import AppModal, { ModalPosition } from "./AppModal";
import { useEffect } from "react";

type OrderItem = {
  id: string | number;
  medicineName: string;
  amount: string;
  quantity: number;
  price: number;
};

type order = {
  orderNumber: string;
  doctorName: string;
  orderedOn: string;
  shippingAddress?: string;
  isDueToday?: string;
  totalPrice: string | number;
  orderItems: OrderItem[];
};

interface CustomerOrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: order | null;
}

const CustomerOrderDetails: React.FC<CustomerOrderDetailsProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!order) return null;
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<OrderDetail />}
      title="Order Details"
      subtitle={order ? `Order #${order.orderNumber}` : ""}
      position={ModalPosition.RIGHT}
    >
      {order && (
        <div className="gap-4">
          {order.orderItems.map((item) => (
            <div key={item.id}>
              <div className="flex items-start space-x-4 p-2 gap-3 pb-3">
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AlphaSyncMed />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#1F2937] font-semibold text-base mb-1">
                    {item.medicineName}
                  </h3>
                  <p className="text-sm font-normal text-[#1F2937] mb-1.5">
                    A synthetic peptide known for its healing properties.
                    BPC-157 promotes tissue...
                  </p>
                  <div className="flex justify-between items-center mt-1 text-sm text-gray-500">
                    <div className="px-2.5 py-0.5 w-36 rounded-full bg-gray-100 border border-gray-200 mb-1.5">
                      <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Recovery & Healing
                      </p>
                    </div>
                    <p className="text-xs font-normal text-gray-800">
                      {item.amount}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2 ">
                    <span className="text-xs font-normal text-[#1F2937]">
                      Quantity
                    </span>
                    <span className="text-xs font-medium text-[#1F2937]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 ">
                    <span className="text-xs font-normal text-[#1F2937]">
                      Price
                    </span>
                    <span className="text-xs font-medium text-[#1F2937]">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 ">
                    <span className="text-base font-medium text-[#1F2937]">
                      Total
                    </span>
                    <span className="text-base font-semibold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-200 my-3"></div>
            </div>
          ))}
          <div className="mt-6 space-y-3 px-2.5 md:px-0 ">
            <div className="flex justify-between">
              <span className="text-sm font-normal text-[#1F2937]">
                Due days
              </span>
              <div className="flex items-center justify-between">
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
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-normal text-[#1F2937]">Doctor</span>
              <span className="text-sm font-medium text-[#1F2937]">
                {order.doctorName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-normal text-[#1F2937]">
                Order Date
              </span>
              <span className="text-sm font-medium text-[#1F2937]">
                {order.orderedOn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-normal text-[#1F2937]">
                Shipping Address
              </span>
              <span className="text-sm font-medium text-gray-800">
                123 Main St, New York, NY 10001
              </span>
            </div>
          </div>
          {/* <div className="w-full h-[1px] bg-gray-200 my-3"></div> */}
          <hr className="my-3 text-gray-200" />
          <div className="flex justify-between px-2.5 md:px-0">
            <span className="text-lg font-semibold text-gray-800">
              Total Order
            </span>
            <span className="text-lg font-semibold text-primary">
              ${order?.totalPrice}
            </span>
          </div>
          <div className="w-full h-[1px] bg-gray-200 my-3"></div>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderDetails;
