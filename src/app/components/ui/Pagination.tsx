"use client";

import React from "react";
import { ArrowLeftIcon } from "@/icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (selectedPage: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const handlePageChange = (selected: number) => {
    onPageChange(selected);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex justify-center flex-col gap-2 md:gap-6 ${className}`}>
      <div className="w-full flex items-center justify-center">
        <div className="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3 h-12 md:h-full rounded-2xl bg-white shadow-table">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="md:px-4 md:py-2 rounded-full absolute left-3 md:left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center h-9 md:w-full md:h-full w-9 justify-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
              <span className="md:mb-0.5">
                <ArrowLeftIcon />
              </span>
              <span className="hidden md:inline-block">Previous</span>
            </span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number;
              if (totalPages <= 5) {
                pageNumber = i;
              } else if (currentPage < 3) {
                pageNumber = i;
              } else if (currentPage > totalPages - 4) {
                pageNumber = totalPages - 5 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-2 rounded-lg h-11 w-11 leading-8 text-center cursor-pointer hidden md:block ${
                    currentPage === pageNumber
                      ? "bg-gray-200 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNumber + 1}
                </button>
              );
            })}

            {/* Show ellipsis if there are more pages */}
            {totalPages > 5 && currentPage < totalPages - 3 && (
              <span className="px-3 py-1 font-semibold text-gray-400 hidden md:block">
                ...
              </span>
            )}

            {/* Show last page if not already visible */}
            {totalPages > 5 && currentPage < totalPages - 3 && (
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                className="px-4 py-2 rounded-lg h-11 w-11 leading-8 text-center cursor-pointer hidden md:block text-gray-600 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="md:px-4 md:py-2 rounded-full bg-gray-50 absolute end-3 md:end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center h-9 md:w-full md:h-full w-9 select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
              <span className="hidden md:inline-block">Next</span>
              <span className="block mb-0.5 rotate-180">
                <ArrowLeftIcon />
              </span>
            </span>
          </button>

          {/* Mobile Page Info */}
          <div className="absolute md:hidden text-gravel font-medium text-sm">
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
