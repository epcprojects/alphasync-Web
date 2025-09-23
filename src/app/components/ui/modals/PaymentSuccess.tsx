import React from "react";
import Verify from "../../../../../public/icons/Verify";
import { CrossIcon } from "@/icons";
import Portal from "../portal";
import ThemeButton from "../buttons/ThemeButton";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface PaymentSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  viewOrder: () => void;
  btnTitle: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  isOpen,
  onClose,
  viewOrder,
  btnTitle,
}) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div
          className="
      relative bg-green-100 sm:rounded-2xl shadow-lg p-6 text-center
      w-full sm:max-w-lg 
      sm:mx-0 sm:w-auto
      h-screen sm:h-auto
      flex flex-col justify-center items-center gap-5
    "
        >
          <div
            onClick={onClose}
            className="absolute top-4 right-4  rounded-full cursor-pointer"
          >
            <CrossIcon fill="#000" />
          </div>
          <div>
            <Verify />
          </div>
          <h2 className="text-2xl font-semibold text-gray-950">
            Payment Successful
          </h2>
          <p className="text-gray-900 text-base font-normal">
            Your order has been confirmed. A receipt has been sent to your
            email.
          </p>
          <ThemeButton
            label={btnTitle}
            onClick={viewOrder}
            variant="outline"
            className="px-8 py-3 whitespace-nowrap font-semibold text-base  outline-none transition cursor-pointer"
          />
        </div>
      </div>
    </Portal>
  );
};

export default PaymentSuccess;
