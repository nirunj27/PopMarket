import { Skeleton } from '@/components/ui/skeleton';

export function LandingBelowFoldSkeleton() {
  return (
    <div className="space-y-12 py-12" aria-busy="true" aria-label="Loading content">
      <div className="content-container mx-auto max-w-7xl px-4 space-y-8">
        <div className="mx-auto max-w-md space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
