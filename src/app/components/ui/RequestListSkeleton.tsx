import React from "react";
import Skeleton from "@/app/components/Skelton";
import { useIsMobile } from "@/hooks/useIsMobile";

const RequestListSkeleton = () => {
  const isMobile = useIsMobile();

  const SkeletonRow = () => {
    if (isMobile) {
      return (
        <div className="p-2 bg-white rounded-lg flex flex-col gap-3 shadow-table">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden sm:grid grid-cols-[1fr_14rem_1fr_1fr_160px] lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_160px] gap-4 items-center rounded-xl bg-white p-1 md:p-3 shadow-table">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="lg:block hidden">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="lg:block hidden">
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-md" />
          <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-md" />
          <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-md" />
          <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-md" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
};

export default RequestListSkeleton;
