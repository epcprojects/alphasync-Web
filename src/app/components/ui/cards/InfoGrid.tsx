"use client";
import React from "react";

interface InfoGridProps {
  category?: string;
  requestedDate?: string;
  reviewedDate?: string;
  doctorName?: string;
  price?: string;
}

const InfoGrid: React.FC<InfoGridProps> = ({
  category,
  requestedDate,
  reviewedDate,
  doctorName,
  price,
}) => {
  const renderItem = (label: string, value?: string, isPrice?: boolean) => {
    if (!value) return null;
    return (
      <div className="flex items-center sm:items-start justify-between flex-row sm:flex-col">
        <span className="block mb-1 text-gray-800 text-xs md:text-sm">
          {label}
        </span>
        <span
          className={`block text-xs md:text-sm font-semibold ${
            isPrice ? "text-primary" : "text-gray-800"
          }`}
        >
          {value}
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 mt-3 sm:mt-auto md:grid-cols-5">
      {renderItem("Category", category)}
      {renderItem("Requested", requestedDate)}
      {renderItem("Reviewed", reviewedDate)}
      {renderItem("Doctor Name", doctorName)}
      {renderItem("Price", price, true)}
    </div>
  );
};

export default InfoGrid;
