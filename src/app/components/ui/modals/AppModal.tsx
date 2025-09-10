"use client";
import React from "react";
import { CrossIcon, ShoppingCartIcon } from "@/icons";
import ThemeButton from "../buttons/ThemeButton";
import Portal from "../portal";

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title = "Modal Title",
  icon = <ShoppingCartIcon fill="#374151" width={15} height={16} />,
  children,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed min-h-dvh z-[100] top-0 inset-0 bg-black/50 backdrop-blur-xs flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-t-xl relative md:rounded-xl max-w-lg w-full overflow-hidden md:m-auto container md:mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 bg-gray-100 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center border border-lightGray">
                {icon}
              </div>
              <h2 className="text-sm md:text-lg text-black font-semibold">
                {title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="md:p-1 p-1 hover:bg-gray-200 rounded-md cursor-pointer"
            >
              <CrossIcon />
            </button>
          </div>

          <div className="bg-white p-3 md:p-5">{children}</div>

          <div className="border-t border-gray-200 bg-white flex items-center justify-between p-2 md:p-4">
            <ThemeButton
              label={cancelLabel}
              onClick={onClose}
              size="small"
              className="min-w-36"
              variant="outline"
            />
            {onConfirm && (
              <ThemeButton
                label={confirmLabel}
                className="min-w-36"
                onClick={onConfirm}
                size="small"
              />
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default AppModal;
