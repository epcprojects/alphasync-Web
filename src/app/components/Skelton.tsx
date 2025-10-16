import React from "react";

const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md ${className}`}
    />
  );
};

export default Skeleton;
