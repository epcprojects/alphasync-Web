import React from "react";
import Skeleton from "@/app/components/Skelton";

interface InventorySkeletonProps {
  viewMode?: "grid" | "list";
}

const InventorySkeleton = ({ viewMode = "grid" }: InventorySkeletonProps) => {
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      {viewMode === "grid" ? (
        /* Grid view skeleton */
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
      ) : (
        /* List view skeleton */
        <div className="flex flex-col gap-2 md:gap-6">
          {/* List header skeleton */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium bg-white rounded-xl text-black shadow-table">
            <div className="col-span-5 md:col-span-4 lg:col-span-5">
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="col-span-1">
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>

          {/* List items skeleton */}
          <div className="space-y-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 items-center rounded-xl bg-white p-3 shadow-table"
              >
                {/* Product info skeleton */}
                <div className="col-span-2 md:col-span-4 lg:col-span-5 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 md:w-14 md:h-14 shrink-0 rounded-md md:rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>

                {/* Category skeleton */}
                <div className="col-span-1 md:col-span-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Stock skeleton */}
                <div className="col-span-1 md:col-span-2 flex items-center">
                  <Skeleton className="h-4 w-16" />
                </div>

                {/* Price skeleton */}
                <div className="col-span-1">
                  <Skeleton className="h-4 w-12" />
                </div>

                {/* Actions skeleton */}
                <div className="col-span-1 flex items-center justify-end md:justify-center gap-2">
                  <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-md" />
                  <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-md" />
                </div>
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
      )}
    </div>
  );
};

export default InventorySkeleton;
