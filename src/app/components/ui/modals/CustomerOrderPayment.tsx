import AppModal, { ModalPosition } from "./AppModal";
import { useEffect } from "react";
import Image from "next/image";
import Card from "../../../../../public/icons/Card";
import ThemeInput from "../inputs/ThemeInput";
import ThemeButton from "../buttons/ThemeButton";

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

interface CustomerOrderPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  order: order | null;
  onClick: () => void;
}

const CustomerOrderPayment: React.FC<CustomerOrderPaymentProps> = ({
  isOpen,
  onClose,
  order,
  onClick
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
  const subTotal = order.orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = (subTotal * 0.08).toFixed(2);
  const total = (subTotal + parseFloat(tax)).toFixed(2);
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Card />}
      title="Complete Payment"
      subtitle={"Your payment information is secure and encrypted"}
      position={ModalPosition.RIGHT}
    >
      {order && (
        <div className="w-full max-w-2xl mx-auto gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-950">
              Order #{order.orderNumber}
            </h2>
            <span className="text-primary text-sm font-semibold">
              {order.orderItems.length.toString().padStart(2, "0")} Items
            </span>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-100 rounded-xl p-1.5 gap-2"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center">
                    <Image
                      alt="#"
                      src={"/images/products/p1.png"}
                      width={1024}
                      height={1024}
                    />
                  </div>
                  <span className="text-sm font-normal text-gray-800 pr-20">
                    {item.medicineName}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-raven bg-white px-2.5 rounded-sm">
                    x{item.quantity}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <hr className=" my-3 md:my-4 text-gray-200" />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Sub total
              </span>
              <span className="text-sm font-medium text-gray-800">
                ${subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-normal text-gray-800">
                Tax (8%)
              </span>
              <span className="text-sm font-medium text-gray-800">${tax}</span>
            </div>
          </div>
          <hr className=" my-3 md:my-4 text-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-800">Total</span>
            <span className="text-base font-semibold text-primary">
              ${total}
            </span>
          </div>
          <hr className=" my-3 md:my-4 text-gray-200" />
          <form className="mx-auto flex flex-col gap-4">
            <ThemeInput
              id="Name"
              label="Name on card"
              name="Name"
              type="Name"
              placeholder="Enter Name"
            />
            <ThemeInput
              id="Card number"
              label="Card number"
              name="Card number"
              type="Card number"
              placeholder="1234 1234 1234 1234"
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <ThemeInput
                  id="Expiry"
                  label="Expiry"
                  name="Expiry"
                  type="Expiry"
                  placeholder="MM / YY"
                />
              </div>
              <div className="flex-1">
                <ThemeInput
                  id="CVV"
                  label="CVV"
                  name="CVV"
                  type="CVV"
                  placeholder="..."
                />
              </div>
            </div>
            <ThemeInput
              id="ZIP Code"
              label="ZIP Code"
              name="ZIP Code"
              type="ZIP Code"
              placeholder="12345"
            />
            <ThemeInput
              id="Billing Address"
              label="Billing Address"
              name="Billing Address"
              type="Billing Address"
              placeholder="Enter Billing address"
            />
          </form>
          <div className="flex mt-16 gap-6 border-t border-gray-200 pt-4">
            <div className="flex-1">
              <ThemeButton label={"Cancel"} variant="outline"  />
            </div>
            <div className="flex-1">
              <ThemeButton label={`Pay $${total}`} variant="filled" onClick={onClick} />
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderPayment;
