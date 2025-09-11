import React from "react";

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
}) => {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-700 font-medium text-start">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full focus:ring p-2 md:px-3 md:py-2.5 min-h-16 max-h-32 border rounded-lg outline-none text-gray-900 placeholder:text-neutral-300 border-lightGray focus:ring-gray-200"
      ></textarea>
    </div>
  );
};

export default TextAreaField;
