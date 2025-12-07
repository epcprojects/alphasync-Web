interface ReminderListSkeletonProps {
  count?: number;
}

export default function ReminderListSkeleton({
  count = 5,
}: ReminderListSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`reminder-skeleton-${index}`}
          className="bg-white rounded-xl shadow-table p-3 md:p-4 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="hidden sm:grid sm:grid-cols-[4fr_2fr_1fr_1fr_3fr] lg:grid-cols-[1fr_1fr_1fr_1fr_400px] gap-4">
            <div className="h-3 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-14 bg-gray-100 rounded" />
          </div>
          <div className="sm:hidden flex flex-col gap-2">
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
            <div className="flex gap-2">
              <span className="h-8 w-full bg-gray-100 rounded-md" />
              <span className="h-8 w-full bg-gray-100 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
