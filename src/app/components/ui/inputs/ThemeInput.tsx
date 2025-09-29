"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { Images } from "../../../ui/images";

export enum InputType {
  TEXT = "text",
  PASSWORD = "password",
  EMAIL = "email",
}

type ThemeInputProps = {
  id?: string;
  label?: string;
  type?: InputType | string;
  placeholder?: string;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  error?: boolean;
  showErrorIcon?: boolean;
  errorMessage?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  maxLength?: number;
};

const ThemeInput: React.FC<ThemeInputProps> = ({
  id,
  label,
  type = InputType.TEXT,
  placeholder,
  required = false,
  name,
  value,
  onChange,
  className = "",
  error = false,
  showErrorIcon = false,
  errorMessage = "",
  autoComplete,
  icon,
  maxLength,
  onBlur,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const normalizedType = useMemo(
    () => String(type || "text").toLowerCase(),
    [type]
  );

  const isPassword = normalizedType === "password";
  const isEmail = normalizedType === "email";

  const renderedType: React.HTMLInputTypeAttribute = isPassword
    ? passwordVisible
      ? "text"
      : "password"
    : (normalizedType as React.HTMLInputTypeAttribute);

  const resolvedAutoComplete =
    autoComplete ??
    (isPassword ? "current-password" : isEmail ? "email" : undefined);
  const iconTotalPadding = 60;

  return (
    <label className="block ">
      {label && (
        <span className="block mb-1 text-sm text-gray-700 font-medium text-start">
          {label} {required && <span className="text-red-500"> *</span>}
        </span>
      )}

      <div className="relative flex items-center">
        {icon && <div className="absolute left-3">{icon}</div>}
        <input
          id={id}
          type={renderedType}
          style={icon ? { paddingLeft: `${iconTotalPadding}px` } : undefined}
          className={`w-full focus:ring h-11 p-2 md:px-3 md:py-2.5 border   rounded-lg outline-none text-gray-900 placeholder:text-gray-500 placeholder:font-normal
            ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-lightGray focus:ring-gray-200"
            }
            ${className}`}
          name={name}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          autoComplete={resolvedAutoComplete}
          inputMode={isEmail ? "email" : undefined}
          maxLength={maxLength}
        />

        {error && showErrorIcon && (
          <Image
            src="/images/errorIcon.svg"
            className="absolute w-5 h-5 top-3 md:top-3.5 right-3"
            alt="Error"
            width={20}
            height={20}
            priority
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            className="absolute p-2 cursor-pointer -translate-y-1/2 rounded-md hover:bg-gray-200 right-2 top-1/2"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? (
              <Image
                src={Images.auth.eyeOpened}
                className="w-5 h-5"
                alt="eyeOpened Icon"
              />
            ) : (
              <Image
                src={Images.auth.eyeClosed}
                className="w-5 h-5"
                alt="eyeClosed Icon"
              />
            )}
          </button>
        )}
      </div>

      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </label>
  );
};

export default ThemeInput;
