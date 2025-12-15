import React from "react";
import Image, { StaticImageData } from "next/image";
import { ToggleGroup } from "@/components";

interface AuthHeaderProps {
  logo: StaticImageData | string; // required
  title?: string;
  width?: string;
  subtitle?: string;
  options?: string[];
  defaultValue?: string;
  onToggleChange?: (value: string) => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  logo,
  title = "Welcome back",
  width = "md:w-96 w-72 sm:w-84",
  subtitle = "",
  options,
  defaultValue,
  onToggleChange,
}) => {
  return (
    <div className={`flex flex-col items-center gap-5 md:gap-6 ${width}`}>
      <Image alt="Auth logo" src={logo} />
      <div className="flex flex-col gap-1">
        {title && (
          <h1 className="text-2xl font-semibold text-center text-gray-900 md:text-3xl">
            {title}
          </h1>
        )}

        {options && options.length > 0 && (
          <ToggleGroup
            options={options}
            defaultValue={defaultValue}
            onChange={onToggleChange}
          />
        )}

        {subtitle && (
          <p
            className={`mb-3 text-sm font-normal text-center text-gray-600 md:mb-6 ${
              !options && "mt-3"
            } `}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthHeader;
