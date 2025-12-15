"use client";
import React, { useState } from "react";

interface ToggleGroupProps {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({
  options,
  defaultValue,
  onChange,
}) => {
  const [selected, setSelected] = useState<string>(defaultValue || options[0]);

  const handleClick = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <div className="flex rounded-xl md:w-96 w-72 sm:w-84 gap-2 mt-2 mb-4 border border-mercury bg-neutral-50 p-1 ">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className={`flex-1 px-4 py-2 w-full cursor-pointer text-sm font-semibold rounded-lg transition-colors
            ${
              selected === option
                ? "bg-white text-gravel shadow"
                : "text-raven hover:bg-white hover:shadow"
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ToggleGroup;
