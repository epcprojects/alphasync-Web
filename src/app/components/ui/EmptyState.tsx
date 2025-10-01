import React from "react";
import { FolderIcon } from "@/icons";

type EmptyStateProps = {
  mtClasses?: string;
  message?: string;
};

export default function EmptyState({
  mtClasses,
  message = "No data found",
}: EmptyStateProps) {
  return (
    <div
      className={`flex items-center gap-1 md:gap-3 ${mtClasses} justify-center 
                  bg-white flex-col rounded-xl h-full min-h-80 md:min-h-96`}
    >
      <FolderIcon />
      <h2 className="text-gray-800 font-medium text-xs md:text-sm">
        {message}
      </h2>
    </div>
  );
}
