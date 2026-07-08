'use client';

import { useEffect } from 'react';
import { PageFallback } from '@/components/ui/page-fallback';

export default function RootError({
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
      description="Something unexpected happened. You can try again or return home."
    />
  );
}
