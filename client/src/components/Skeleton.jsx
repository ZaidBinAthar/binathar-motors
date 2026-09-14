const Skeleton = ({ className = "" }) => (
  <div className={`animate-shimmer bg-gradient-to-r from-border via-surface-alt to-border bg-[length:200%_100%] rounded ${className}`} />
);

export const BikeCardSkeleton = () => (
  <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border overflow-hidden">
    <Skeleton className="h-52 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

export const BikeDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <div>
      <Skeleton className="h-80 md:h-96 w-full rounded-xl" />
      <div className="flex gap-2 mt-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-20 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-10 w-36" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-5 space-y-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-12" />
      </div>
    ))}
  </div>
);

export default Skeleton;
