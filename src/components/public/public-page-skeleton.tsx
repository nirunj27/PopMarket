import { Skeleton } from '@/components/ui/skeleton';

function PortalHeaderSkeleton() {
  return (
    <div className="mb-3 space-y-2 border-b border-border pb-2.5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-56 max-w-full" />
      <Skeleton className="h-3 w-72 max-w-full" />
    </div>
  );
}

export function ApplyPageSkeleton() {
  return (
    <div
      className="public-portal-sheet mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-5"
      aria-busy="true"
      aria-label="Loading application form"
    >
      <PortalHeaderSkeleton />
      <div className="grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </aside>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PublicEventPageSkeleton() {
  return (
    <div
      className="public-portal-sheet mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-5"
      aria-busy="true"
      aria-label="Loading event"
    >
      <Skeleton className="mb-3 h-28 w-full rounded-lg" />
      <PortalHeaderSkeleton />
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function RsvpPassPageSkeleton() {
  return (
    <div
      className="public-portal-sheet mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-5"
      aria-busy="true"
      aria-label="Loading RSVP pass"
    >
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[420px] w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function VendorStatusPageSkeleton() {
  return (
    <div
      className="public-portal-sheet mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-5"
      aria-busy="true"
      aria-label="Loading vendor status"
    >
      <PortalHeaderSkeleton />
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PublicPageSkeleton() {
  return (
    <div
      className="public-portal-sheet mx-auto w-full max-w-3xl px-3 py-12 sm:px-4"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="space-y-4">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <Skeleton className="mt-6 h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
