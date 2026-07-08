'use client';

import { useEffect } from 'react';
import { PageFallback } from '@/components/ui/page-fallback';

export default function PublicError({
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
      homeHref="/"
      title="Could not load this page"
      description="The event or pass may be unavailable right now. Please try again."
      className="public-portal-sheet mx-auto w-full max-w-lg"
    />
  );
}
