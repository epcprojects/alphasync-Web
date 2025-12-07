import Skeleton from "@/app/components/Skelton";

const OrderHistorySkeleton = () => {
  const renderCardSkeleton = (key: number) => (
    <div
      key={key}
      className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {Array.from({ length: 3 }).map((_, index) => renderCardSkeleton(index))}
    </div>
  );
};

export default OrderHistorySkeleton;
