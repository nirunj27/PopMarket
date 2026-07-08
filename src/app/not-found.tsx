import Link from 'next/link';
import { PageFallback } from '@/components/ui/page-fallback';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <PageFallback
        variant="notFound"
        homeHref="/"
        description="Check the link or head back to the homepage."
      >
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
          Open dashboard
        </Link>
      </PageFallback>
    </div>
  );
}
