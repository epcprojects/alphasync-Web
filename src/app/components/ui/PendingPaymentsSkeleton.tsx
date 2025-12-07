import Skeleton from "@/app/components/Skelton";

const PendingPaymentsSkeleton = () => {
  const CardSkeleton = (key: number) => (
    <div
      key={key}
      className="bg-white rounded-2xl shadow-table border border-gray-200 p-4 2xl:p-6 w-full max-w-7xl"
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 mb-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        <Skeleton className="w-11 h-11 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 1 }).map((_, index) => CardSkeleton(index))}
    </div>
  );
};

export default PendingPaymentsSkeleton;
