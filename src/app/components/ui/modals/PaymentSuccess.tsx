import React, { useEffect } from "react";
import Verify from "../../../../../public/icons/Verify";
import { CrossIcon } from "@/icons";
import Portal from "../portal";

interface PaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  viewOrder: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  isOpen,
  onClose,
  viewOrder,
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
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="relative bg-success-100 rounded-2xl shadow-lg  max-w-lg p-6 text-center">
          <div
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full cursor-pointer"
          >
            <CrossIcon fill="#000" />
          </div>
          <div className="flex justify-center my-4">
            <Verify />
          </div>
          <h2 className="text-2xl font-semibold text-gray-950">
            Payment Successful
          </h2>
          <p className="text-gray-900 mt-2 text-base font-normal">
            Your order has been confirmed. A receipt has been sent to your
            email.
          </p>
          <button
            onClick={viewOrder}
            className="mt-6 bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold text-base transition cursor-pointer"
          >
            View Order
          </button>
        </div>
      </div>
    </Portal>
  );
};

export default PaymentSuccess;
