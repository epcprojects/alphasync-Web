import React, { useState } from "react";
import { CrossIcon } from "@/icons";

interface QuickTemplatesProps {
  templates: string[];
}

const QuickTemplates: React.FC<QuickTemplatesProps> = ({ templates }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="p-1.5 md:p-3 rounded-xl bg-gray-50 relative">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-1 hover:text-gray-700 cursor-pointer text-gray-500 hover:bg-gray-300 rounded-lg p-1.5 end-1"
      >
        <CrossIcon fill="currentColor" width="16" height="16" />
      </button>

      <h2 className="text-gray-500 mb-2 md:mb-3 font-semibold text-xs">
        Quick message templates:
      </h2>
      <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
        {templates.map((template, index) => (
          <button
            key={index}
            className="text-xs md:text-sm bg-white cursor-pointer hover:bg-gray-50 text-gray-700 font-medium rounded-md px-2 md:px-4 py-1 md:py-2 border border-gray-200"
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTemplates;
