"use client";
import React from "react";
import { CrossIcon, ShoppingCartIcon } from "@/icons";
import ThemeButton, { buttonVariant } from "../buttons/ThemeButton";
import Portal from "../portal";

export enum ModalPosition {
  CENTER = "center",
  RIGHT = "right",
}

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: "small" | "medium" | "large";
  outSideClickClose?: boolean;
  onCancel?: () => void;
  confirmBtnVarient?: buttonVariant;
  position?: ModalPosition;
}

const sizeClasses = {
  small: "max-w-sm", // ~384px
  medium: "max-w-lg", // ~512px
  large: "max-w-3xl", // ~672px
  extraLarge: "max-w-5xl", // ~1024
};

const AppModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  title = "Modal Title",
  subtitle,
  icon = <ShoppingCartIcon fill="#374151" width={15} height={16} />,
  children,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  size = "medium",
  outSideClickClose = true,
  onCancel,
  confirmBtnVarient,
  position = ModalPosition.CENTER,
}) => {
  if (!isOpen) return null;

  const baseModalClasses = "bg-white shadow-xl flex flex-col";
  const baseWrapperClasses =
    "fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex";

  const modalClasses =
    position === ModalPosition.RIGHT
      ? `${baseModalClasses} h-full md:h-[calc(96%)] md:m-5 w-full md:w-[600px] md:rounded-[12px] overflow-hidden`
      : `${baseModalClasses} rounded-t-xl relative md:rounded-xl w-full overflow-hidden md:m-auto container md:mx-4 ${sizeClasses[size]}`;

  const wrapperClasses =
    position === ModalPosition.RIGHT
      ? `${baseWrapperClasses} justify-end items-stretch`
      : `${baseWrapperClasses} min-h-dvh top-0 items-end md:items-center justify-center`;

  return (
    <Portal>
      <div
        className={wrapperClasses}
        onClick={outSideClickClose ? onClose : undefined}
      >
        <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 bg-gray-100 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center border border-lightGray">
                {icon}
              </div>
              <div>
                <h2 className="text-sm md:text-lg text-black font-semibold">
                  {title}
                </h2>
                {subtitle && (
                  <h3 className="text-gray-500 text-xs md:text-sm">
                    {subtitle}
                  </h3>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="md:p-1 p-1 hover:bg-gray-200 rounded-md cursor-pointer"
            >
              <CrossIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-3 md:p-5">
            {children}
          </div>

          {!position && (
            <div className="border-t border-gray-200 bg-white flex items-center justify-between p-2 md:p-4">
              <ThemeButton
                label={cancelLabel}
                onClick={onCancel ? onCancel : onClose}
                size="medium"
                className="min-w-36"
                variant="outline"
                heightClass="h-10"
              />
              {onConfirm && (
                <ThemeButton
                  label={confirmLabel}
                  className="min-w-36"
                  onClick={onConfirm}
                  size="medium"
                  heightClass="h-10"
                  variant={confirmBtnVarient}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};

export default AppModal;
