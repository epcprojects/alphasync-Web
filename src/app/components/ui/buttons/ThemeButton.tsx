import React from "react";

interface ThemeButtonProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  label,
  onClick,
  className,
  icon,
  disabled,
}) => {
  return (
    <div
      className={`${
        disabled
          ? "bg-gray-300"
          : "bg-gradient-to-r group from-[#3C85F5]  to-[#1A407A] hover:from-[#3C85F5] hover:to-[#1A407A] hover:bg-gradient-to-l"
      } p-[1px] rounded-full ${className}`}
    >
      <div className="rounded-3xl p-0.5 bg-gradient-to-t from-[#ffffff12] to-[#ffffff00]">
        <button
          disabled={disabled}
          onClick={onClick}
          className={`
            p-2 w-full md:p-2.5 flex disabled:cursor-not-allowed  items-center gap-2  justify-center text-xs md:text-sm rounded-full 
                     bg-gradient-to-r cursor-pointer 
                     group-hover:bg-gradient-to-l text-white
                     transition-colors duration-1000 ease-in-out font-semibold ${
                       disabled
                         ? "disabled:bg-gray-300 "
                         : "group-hover:from-[#3C85F5] group-hover:to-[#1A407A] from-[#3C85F5] to-[#1A407A]"
                     }`}
        >
          {icon && <span className="flex items-center">{icon}</span>} {label}
        </button>
      </div>
    </div>
  );
};

export default ThemeButton;
