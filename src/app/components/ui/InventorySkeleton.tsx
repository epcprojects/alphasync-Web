import React from "react";
import Skeleton from "@/app/components/Skelton";

const InventorySkeleton = () => {
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      {/* Header skeleton */}
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <Skeleton className="w-8 h-8 md:w-11 md:h-11 rounded-full" />
          <Skeleton className="h-6 md:h-8 w-48" />
        </div>

        {/* Search bar skeleton */}
        <div className="bg-white rounded-full w-full flex items-center gap-1 md:gap-2 p-1.5 md:px-2.5 md:py-2 shadow-table lg:w-fit">
          <Skeleton className="h-8 md:h-11 w-full md:min-w-80 rounded-full" />
        </div>
      </div>

      {/* Grid view skeleton */}
      <div className="flex flex-col gap-2 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-table p-4">
              {/* Product image skeleton */}
              <Skeleton className="w-full h-48 rounded-lg mb-4" />
              
              {/* Product title skeleton */}
              <Skeleton className="h-5 w-3/4 mb-2" />
              
              {/* Product description skeleton */}
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              
              {/* Price and stock skeleton */}
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              
              {/* Button skeleton */}
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySkeleton;
