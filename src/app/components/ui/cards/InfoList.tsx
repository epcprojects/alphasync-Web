"use client";
import React from "react";

interface InfoRow {
  label: string;
  value: string | React.ReactNode;
}

interface InfoListProps {
  items: InfoRow[];
}

const InfoList: React.FC<InfoListProps> = ({ items }) => {
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center py-1.5 last:border-b-0 border-b gap-1 md:gap-2 border-b-gray-200 justify-between"
        >
          <span className="text-gray-900 text-xs md:text-sm block">
            {item.label}
          </span>
          <span className="text-gray-900 text-xs md:text-sm block font-semibold">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InfoList;
