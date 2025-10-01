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
      <div className="fixed inset-0 z-[99] flex sm:items-center sm:justify-center bg-black/40  backdrop-blur-xs">
        <div
          className="
      relative bg-green-100 sm:rounded-2xl shadow-lg sm:py-12 px-6 sm:px-10 text-center
      w-full sm:max-w-lg 
      sm:mx-0 h-auto
      flex flex-col justify-center items-center gap-5
    "
        >
          <div
            onClick={onClose}
            className="hidden sm:block absolute top-4 right-4  rounded-full cursor-pointer"
          >
            <CrossIcon fill="#000" />
          </div>
          <Verify />
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-gray-950">
                Payment Successful
              </h2>
              <p className="text-gray-900 text-base font-normal">
                Your order has been confirmed. A receipt has been sent to your
                email.
              </p>
            </div>
            <ThemeButton
              label={btnTitle}
              onClick={viewOrder}
              variant="outline"
              className=" w-fit whitespace-nowrap font-semibold text-base outline-none transition cursor-pointer"
              minWidthClass={"min-w-40"}
            />
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default PaymentSuccess;
