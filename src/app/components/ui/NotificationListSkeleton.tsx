"use client";

import React from "react";
import Skeleton from "@/app/components/Skelton";

const NotificationListSkeleton = () => {
  const items = Array.from({ length: 3 });

  return (
    <>
      {items.map((_, index) => (
        <div
          key={index}
          className="p-3 border-b border-mercury last:border-b-0 md:p-5 flex items-start gap-3 justify-between"
        >
          <div className="flex items-start gap-3 w-full">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-5/6" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </>
  );
};

export default NotificationListSkeleton;
