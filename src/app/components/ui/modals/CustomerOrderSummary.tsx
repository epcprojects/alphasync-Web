import OrderDetail from "../../../../../public/icons/OrdeerDetail";
import AppModal, { ModalPosition } from "./AppModal";
import { trackingSummary } from "../../../../../public/data/Summary";
import { Tick } from "@/icons";
import OrderSummaryCard from "../cards/OrderSummaryCards";

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

interface CustomerOrderSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  order: order | null;
}

const CustomerOrderSummary: React.FC<CustomerOrderSummaryProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<OrderDetail />}
      title="Order Details"
      subtitle={order ? `Order #${order.orderNumber}` : ""}
      position={ModalPosition.RIGHT}
      showFooter={false}
    >
      {order && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-primary">Order Items</h2>
            <div className="w-6 h-6 rounded-full bg-gray-50 border border-mercury flex justify-center items-center">
              <p className="text-xs font-semibold text-gravel">
                {order.orderItems.length}
              </p>
            </div>
          </div>
          <div className="bg-gray-100 rounded-xl">
            {order.orderItems.map((item) => (
              <OrderSummaryCard key={item.id} item={item} />
            ))}
          </div>
          <h2 className="text-lg font-semibold text-primary">Order Summary</h2>
          <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-xl ">
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Due days
              </span>
              <div className="flex items-center justify-between">
                <span
                  className={`
                       bg-success-50
                   border  border-success-200 text-success-500 px-2.5 py-0.5 rounded-full text-sm font-medium`}
                >
                  Paid
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
            <hr className="text-gray-200" />
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-800">
                Total Order
              </span>
              <span className="text-lg font-semibold text-primary">
                ${order?.totalPrice}
              </span>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-primary">
            Shipment Travel History
          </h2>
          <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-xl ">
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Tracking Number
              </span>
              <span className="text-sm font-medium text-gray-800">
                784562193045
              </span>
            </div>
            <div className="flex justify-between item">
              <span className="text-sm font-normal text-gray-800">Doctor</span>
              <span className="text-sm font-medium text-gray-800">
                {order.doctorName}
              </span>
            </div>
            <div className="flex justify-between item">
              <span className="text-sm font-normal text-gray-800">
                Service Type:
              </span>
              <span className="text-sm font-medium text-gray-800">
                FedEx Ground
              </span>
            </div>
            <div className="flex justify-between item">
              <span className="text-sm font-normal text-gray-800">
                Ship Date
              </span>
              <span className="text-sm font-medium text-gray-800">
                Aug 24, 2025
              </span>
            </div>
            <div className="flex justify-between item">
              <span className="text-sm font-normal text-gray-800">
                Estimated Delivery:
              </span>
              <span className="text-sm font-medium text-gray-800">
                Aug 28, 2025
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {/* {trackingSummary.map((event, index) => (
              <div key={event.id} className="flex gap-4 relative">
                <div className="flex flex-col items-center relative">
                  {event.isDelivered ? (
                    <Tick />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white border border-mercury flex justify-center items-center z-10">
                      <p className="text-xs font-semibold text-gravel">
                        {event.id}
                      </p>
                    </div>
                  )}
                  {index !== trackingSummary.length - 1 && (
                    <div className="absolute top-8  border-lightGray border-l-2 border-dotted h-[70%]" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 pb-4">
                  <p className="text-sm font-semibold text-gravel">
                    {event.date} – {event.time}
                  </p>
                  <p className="text-sm font-normal text-tertiary">
                    {event.status}{" "}
                    <span className="text-gray-600">| {event.location}</span>
                  </p>
                  {event.note && (
                    <p className="text-sm font-normal text-tertiary">
                      {event.note}
                      {event.note}
                      {event.note}
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            ))} */}
            {trackingSummary.map((event, index) => (
              <div key={event.id} className="flex gap-4 relative">
                <div className="flex flex-col items-center relative">
                  {event.isDelivered ? (
                    <Tick />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white border border-mercury flex justify-center items-center z-10">
                      <p className="text-xs font-semibold text-gravel">
                        {event.id}
                      </p>
                    </div>
                  )}
                  {index !== trackingSummary.length - 1 && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 border-lightGray border-l-2 border-dotted bottom-0 -mb-2" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 flex-1 pb-4">
                  <p className="text-sm font-semibold text-gravel">
                    {event.date} – {event.time}
                  </p>
                  <p className="text-sm font-normal text-tertiary">
                    {event.status}{" "}
                    <span className="text-gray-600">| {event.location}</span>
                  </p>
                  {event.note && (
                    <p className="text-sm font-normal text-tertiary">
                      {event.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderSummary;
