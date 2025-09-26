import React from "react";

type buttonType = "button" | "submit" | "reset";
type buttonSize = "small" | "medium" | "large";
export type buttonVariant =
  | "filled"
  | "outline"
  | "success"
  | "primaryOutline"
  | "danger";
interface ThemeButtonProps {
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: buttonType;
  size?: buttonSize;
  variant?: buttonVariant;
  heightClass?: string;
  minWidthClass?: string;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  label,
  onClick,
  className,
  icon,
  disabled,
  type = "button",
  size = "medium",
  variant = "filled",
  heightClass,
  minWidthClass
}) => {
  const sizeClasses: Record<buttonSize, string> = {
    small: "px-3 py-1 text-xs",
    medium: "md:px-4 p-2 md:p-2  text-sm",
    large: "px-6 py-2.5 text-base",
  };

  const baseClasses =
    "flex items-center group gap-2 whitespace-nowrap h-full justify-center w-full cursor-pointer font-semibold rounded-full transition-colors duration-300 ease-in-out disabled:cursor-not-allowed";

  const variantClasses: Record<buttonVariant, string> = {
    filled: disabled
      ? "bg-gray-200 text-gray-400"
      : "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white hover:bg-gradient-to-l group-hover:bg-gradient-to-l",
    outline:
      "bg-white   text-gray-700 group-hover:!bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200",
    success: "text-green-600 bg-green-50 group-hover:bg-green-200",
    primaryOutline:
      "text-primary border border-white bg-white group-hover:bg-primary group-hover:text-white group-hover:border-primary",
    danger:
      "text-white bg-red-500 border border-red-500 group-hover:bg-red-700 group-hover:border-red-700",
  };

  return (
    <div
      className={`group  flex items-center ${heightClass && heightClass} ${
        variant === "filled" && !disabled
          ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] hover:from-[#3C85F5] hover:to-[#1A407A] hover:bg-gradient-to-l p-[0px]"
          : "p-0"
      } rounded-full  ${className}`}
    >
      <div
        className={`rounded-3xl p-0.5 w-full h-full  ${
          variant === "filled"
            ? " bg-gradient-to-b from-[#ffffff12] to-transparent"
            : variant === "outline"
            ? "bg-white border !p-0 border-gray-200 group-hover:!bg-gray-100"
            : variant === "primaryOutline"
            ? "border border-primary !p-0"
            : variant === "danger"
            ? "border border-red-500 !p-0"
            : "bg-green-50 border border-green-200 group-hover:bg-green-200"
        }`}
      >
        <button
          disabled={disabled}
          onClick={onClick}
          type={type}
          className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${minWidthClass}`}
        >
          {icon && <span className="flex items-center ">{icon}</span>} {label}
        </button>
      </div>
    </div>
  );
};

export default ThemeButton;
