import OrderDetail from "../../../../../public/icons/OrdeerDetail";
import AppModal, { ModalPosition } from "./AppModal";
import { useEffect } from "react";
import Image from "next/image";

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
  const getDueTodayClasses = (status?: string) => {
    switch (status) {
      case "Due Today":
        return "bg-red-50 border border-red-200 text-red-700";
      default:
        return "bg-green-50 border border-green-200 text-green-700";
    }
  };
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
              <div className="flex items-start gap-3 p-2">
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
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
                  <div className="hidden md:flex">
                    <p className="text-sm font-normal text-gray-800 line-clamp-2">
                      A synthetic peptide known for its healing properties.
                      BPC-157 promotes tissue...
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 mb-1.5">
                      <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Recovery & Healing
                      </p>
                    </div>
                    <p className="text-xs font-normal text-gray-800">
                      {item.amount}
                    </p>
                  </div>
                  {/* Desktop version - hidden on mobile, shown on desktop */}
                  <div className="hidden md:flex md:flex-col md:gap-2">
                    <div className="flex justify-between">
                      <span className="text-xs font-normal text-gray-800">
                        Quantity
                      </span>
                      <span className="text-xs font-medium text-gray-800">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-normal text-gray-800">
                        Price
                      </span>
                      <span className="text-xs font-medium text-gray-800">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-800">
                        Total
                      </span>
                      <span className="text-base font-semibold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mobile version - full width, aligned from start */}
              <div className="w-full px-2 md:hidden">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-normal text-gray-800">
                      Quantity
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-normal text-gray-800">
                      Price
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-800">
                      Total
                    </span>
                    <span className="text-base font-semibold text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <hr className=" my-3 md:my-4 text-gray-200" />
            </div>
          ))}
          <div className="mt-6 flex flex-col gap-4 px-2.5 md:px-0 ">
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Due days
              </span>
              <div className="flex items-center justify-between">
                <span
                  className={`${getDueTodayClasses(order.isDueToday)} px-3 py-1 rounded-full text-sm font-medium`}
                >
                  {order.isDueToday}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">Doctor</span>
              <span className="text-sm font-medium text-gray-800">
                {order.doctorName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Order Date
              </span>
              <span className="text-sm font-medium text-gray-800">
                {order.orderedOn}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Shipping Address
              </span>
              <span className="text-sm font-medium text-gray-800">
                123 Main St, New York, NY 10001
              </span>
            </div>
          </div>
          <hr className=" my-3 md:my-4 text-gray-200" />
          <div className="flex justify-between items-center px-2.5 md:px-0">
            <span className="text-lg font-semibold text-gray-800">
              Total Order
            </span>
            <span className="text-lg font-semibold text-primary">
              ${order?.totalPrice}
            </span>
          </div>
          <hr className="hidden md:block my-3 md:my-4 text-gray-200" />
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderDetails;
