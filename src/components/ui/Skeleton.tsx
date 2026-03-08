import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

// Primitive
export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('shimmer rounded-[10px]', className)} style={style} />;
}

// Catalog page — full page skeleton
export function CatalogSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header skeleton */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-black/[0.06]">
        <Skeleton className="w-9 h-9 rounded-[12px]" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      {/* Category pills skeleton */}
      <div className="px-4 py-2 flex gap-2">
        {[80, 60, 72, 56].map((w, i) => (
          <Skeleton key={i} className={`h-7 rounded-full`} style={{ width: w }} />
        ))}
      </div>
      {/* Product grid skeleton — 6 cards */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-3 max-w-lg mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[18px] overflow-hidden bg-[#F5F4F0]">
            <Skeleton className="aspect-square rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-full rounded-full mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard products grid skeleton
export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-[18px] overflow-hidden bg-[#F5F4F0] border border-black/[0.06] shadow-ios-sm">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="p-2.5 space-y-2 flex-1 flex flex-col">
            <Skeleton className="h-2 w-1/3 rounded-full mb-0.5" />
            <Skeleton className="h-3.5 w-full flex-1" />
            <Skeleton className="h-3.5 w-1/2 mt-1" />
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/[0.04]">
              <Skeleton className="h-5 w-8 rounded-full" />
              <div className="flex gap-1.5">
                <Skeleton className="h-6 w-6 rounded-[8px]" />
                <Skeleton className="h-6 w-6 rounded-[8px]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Overview dashboard skeleton
export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Link Card Skeleton */}
      <section>
        <Skeleton className="h-3 w-32 mb-1.5 px-1" />
        <div className="bg-[#F5F4F0] rounded-[18px] p-4 flex flex-col gap-3 shadow-ios-sm">
          <Skeleton className="h-10 w-full rounded-[14px]" />
          <Skeleton className="h-4 w-40 px-1" />
        </div>
      </section>

      {/* Stats Chips Skeleton */}
      <section>
        <Skeleton className="h-3 w-24 mb-1.5 px-1" />
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {[1,2,3].map(i => (
            <Skeleton key={i} className="h-10 w-32 flex-shrink-0 rounded-full" />
          ))}
        </div>
      </section>

      {/* Chart Skeleton */}
      <section>
        <Skeleton className="h-3 w-40 mb-1.5 px-1" />
        <Skeleton className="h-[160px] w-full rounded-[18px]" />
      </section>

      {/* Recent Products Skeleton */}
      <section>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="bg-[#F5F4F0] rounded-[18px] overflow-hidden shadow-ios-sm border border-black/[0.06]">
          <div className="flex flex-col">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center p-3 gap-3 border-b border-black/[0.04]">
                <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// Settings page skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <Skeleton className="h-7 w-32" />
      </div>

      {[1, 2, 3].map((sectionIndex) => (
        <section key={sectionIndex}>
          <Skeleton className="h-3 w-32 mb-1.5 px-3" />
          <div className="bg-[#F5F4F0] rounded-[18px] border border-black/[0.06] shadow-ios-sm overflow-hidden">
            <div className="py-3 px-4 flex items-center justify-between border-b border-black/[0.04]">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-[8px]" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="w-4 h-4 rounded-full" />
              </div>
            </div>
             <div className="py-3 px-4 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-[8px]" />
              </div>
            </div>
          </div>
        </section>
      ))}

      <Skeleton className="h-12 w-full rounded-[14px]" />
    </div>
  );
}