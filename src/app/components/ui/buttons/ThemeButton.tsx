import React from "react";

type buttonType = "button" | "submit" | "reset";
type buttonSize = "small" | "medium" | "large";
type buttonVariant = "filled" | "outline" | "success";
interface ThemeButtonProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: buttonType;
  size?: buttonSize;
  variant?: buttonVariant;
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
}) => {
  const sizeClasses: Record<buttonSize, string> = {
    small: "px-3 py-1.5 text-xs",
    medium: "md:px-4 p-2 md:p-2.5  text-sm",
    large: "px-6 py-3 text-base",
  };

  const baseClasses =
    "flex items-center group gap-2 justify-center w-full cursor-pointer font-semibold rounded-full transition-colors duration-300 ease-in-out disabled:cursor-not-allowed";

  const variantClasses: Record<buttonVariant, string> = {
    filled: disabled
      ? "bg-gray-300 text-white"
      : "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white hover:bg-gradient-to-l group-hover:bg-gradient-to-l",
    outline:
      "bg-white   text-gray-700 group-hover:!bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200",
    success: "text-green-600 bg-green-50 group-hover:bg-green-200",
  };

  return (
    <div
      className={`group ${
        variant === "filled" && !disabled
          ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] hover:from-[#3C85F5] hover:to-[#1A407A] hover:bg-gradient-to-l p-[1px]"
          : ""
      } rounded-full  ${className}`}
    >
      <div
        className={`rounded-3xl p-0.5   ${
          variant === "filled"
            ? " bg-gradient-to-t from-[#ffffff12] to-[#ffffff00]"
            : variant === "outline"
            ? "bg-white border border-gray-200 group-hover:!bg-gray-100"
            : "bg-green-50 border border-green-200 group-hover:bg-green-200"
        }`}
      >
        <button
          disabled={disabled}
          onClick={onClick}
          type={type}
          className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
        >
          {icon && <span className="flex items-center">{icon}</span>} {label}
        </button>
      </div>
    </div>
  );
};

export default ThemeButton;
