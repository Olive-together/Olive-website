/**
 * ActivityCardSkeleton — shimmer placeholder that matches the ActivityCard grid layout.
 * Use while activity data is loading to prevent layout shift and feel more premium.
 */
export function ActivityCardSkeleton() {
  return (
    <div className="card-hover overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-40 bg-olive-100 rounded-t-3xl relative overflow-hidden">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-olive-100 rounded-full w-3/4 relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
        <div className="h-3 bg-olive-100 rounded-full w-1/2 relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>

        {/* Meta lines */}
        <div className="space-y-2 pt-1">
          <div className="h-3 bg-olive-100 rounded-full w-2/3 relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          <div className="h-3 bg-olive-100 rounded-full w-1/2 relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        </div>

        {/* Host row */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-5 h-5 rounded-full bg-olive-100 flex-shrink-0 relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
          <div className="h-3 bg-olive-100 rounded-full w-24 relative overflow-hidden">
            <div className="skeleton-shimmer absolute inset-0" />
          </div>
        </div>

        {/* Capacity bar */}
        <div className="h-1.5 bg-olive-100 rounded-full relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>

        {/* Button */}
        <div className="h-9 bg-olive-100 rounded-xl relative overflow-hidden">
          <div className="skeleton-shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}

/** Renders n skeleton cards in a responsive grid */
export function ActivityCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  );
}
