import React from "react";
import { Portal, ThemeButton } from "@/components";
import { CrossIcon, SuccessCheckIcon } from "@/icons";

type InfoModalType = "success" | "danger";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClick: () => void;
  title?: string;
  subtitle?: string;
  email?: string;
  mainText?: string;
  buttonLabel?: string;
  type?: InfoModalType;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  onClick,
  title,
  subtitle,
  email,
  mainText,
  type = "success",
  buttonLabel = "Back to Login",
}) => {
  const icon = type === "success" ? <SuccessCheckIcon /> : <CrossIcon />;
  if (!isOpen) return null;
  return (
    <Portal>
      <div className="fixed min-h-dvh z-[100]  top-0 inset-0 bg-black/50 backdrop-blur-xs flex    items-center justify-center ">
        <div
          className="bg-white  relative rounded-2xl max-w-xs md:max-w-lg w-full    md:m-auto md:p-8 p-5 pt-8 container md:mx-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end ">
            <button
              onClick={onClose}
              className="md:p-1 p-1 hover:bg-gray-100 absolute top-2 end-2 rounded-md cursor-pointer"
            >
              <CrossIcon fill="black" />
            </button>
          </div>

          <div className="flex items-center flex-col gap-3 md:gap-5 justify-center">
            {icon}
            <h2 className="text-gray-950 font-medium text-center text-2xl md:text-3xl">
              {title}
            </h2>

            <p className="text-gray-500 font-normal text-center text-sm ">
              {subtitle}{" "}
              <span className="text-gray-900 font-semibold underline underline-offset-1">
                {email}
              </span>{" "}
              {mainText}
            </p>

            <ThemeButton
              label={buttonLabel}
              className="w-full"
              onClick={() => onClick()}
              heightClass="h-11"
            />
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default InfoModal;
