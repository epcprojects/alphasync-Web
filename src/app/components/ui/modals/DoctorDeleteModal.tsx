import React from "react";
import { Portal, ThemeButton } from "@/components";
import { UserRemoveIcon } from "@/icons";

interface DoctorDeleteModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onDelete: () => void;
  title?: string;
  subtitle?: string;
}

const DoctorDeleteModal: React.FC<DoctorDeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  title,
  subtitle,
}) => {
  if (!isOpen) return null;
  return (
    <Portal>
      <div className="fixed min-h-dvh z-[100]  top-0 inset-0 bg-black/50 backdrop-blur-xs flex    items-center justify-center ">
        <div
          className="bg-white  relative rounded-2xl max-w-xs md:max-w-lg w-full  gap-4 md:gap-6 flex flex-col  md:m-auto md:p-6 p-3 pt-8 container md:mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center flex-col gap-3 md:gap-5 justify-center">
            <UserRemoveIcon />
            <div className="space-y-2">
              <h2 className="text-gray-950 font-medium text-center text-2xl md:text-3xl">
                {title}
              </h2>

              <p className="text-gray-500 font-normal text-center text-sm ">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeButton
              label="Cancel"
              className="w-full"
              onClick={onClose}
              heightClass="h-10"
              variant="outline"
            />

            <ThemeButton
              label="Delete"
              className="w-full"
              onClick={onDelete}
              heightClass="h-10"
              variant="danger"
            />
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DoctorDeleteModal;
