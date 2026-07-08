'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { PageFallback } from '@/components/ui/page-fallback';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageFallback
      variant="error"
      reset={reset}
      homeHref="/dashboard"
      title="Dashboard error"
      description="We could not load this section. Your data is safe — try refreshing."
    >
      <Link href="/dashboard/events" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
        Back to events
      </Link>
    </PageFallback>
  );
}
