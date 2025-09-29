import OrderDetail from "../../../../../public/icons/OrdeerDetail";
import AppModal, { ModalPosition } from "./AppModal";
import OrderItemCard from "../cards/OrderItemCards";
import { pageVarient } from "../cards/PrescriptionOrderCard";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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
  status?: string;
};

interface CustomerOrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: order | null;
  type?: pageVarient;
}

const CustomerOrderDetails: React.FC<CustomerOrderDetailsProps> = ({
  isOpen,
  onClose,
  order,
  type = "order",
}) => {
  useBodyScrollLock(isOpen);
  if (!order) return null;
  const getOrderTags = (status?: string) => {
    switch (status) {
      case "Due Today":
        return "bg-red-50 border border-red-200 text-red-700";
      case "Processing":
        return "bg-amber-50 border border-amber-200 text-amber-700";
      case "Ready for Pickup":
        return "bg-blue-50 border border-blue-200 text-blue-700";
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
      outSideClickClose={false}
      subtitle={order ? `Order #${order.orderNumber}` : ""}
      position={ModalPosition.RIGHT}
      showFooter={false}
    >
      {order && (
        <div className="flex flex-col gap-4">
          {order.orderItems.map((item) => (
            <OrderItemCard key={item.id} item={item} />
          ))}
          <div className="flex flex-col gap-4 px-2.5 md:px-0 border-b border-gray-200 pb-4 ">
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Due days
              </span>
              <div className="flex items-center justify-between">
                <span
                  className={`${getOrderTags(
                    type === "order" ? order.status : order.isDueToday
                  )} px-3 py-0.5 rounded-full text-sm font-medium`}
                >
                  {type === "order" ? order.status : order.isDueToday}
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
              <span className="text-sm font-normal text-gray-800 flex-1">
                Shipping Address
              </span>
              <span className="text-sm font-medium text-gray-800">
                123 Main St, New York, NY 10001
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center px-2.5 md:px-0 border-b border-gray-200 pb-4">
            <span className="text-lg font-semibold text-gray-800">
              Total Order
            </span>
            <span className="text-lg font-semibold text-primary">
              ${order?.totalPrice}
            </span>
          </div>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderDetails;
