import Link from 'next/link';
import { PageFallback } from '@/components/ui/page-fallback';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export default function PublicNotFound() {
  return (
    <div className="public-portal-sheet mx-auto w-full max-w-lg px-3 py-12 sm:px-4">
      <PageFallback
        variant="notFound"
        title="Not found"
        description="This event, pass, or application link may be invalid or expired."
        homeHref="/"
      >
        <Link href="/dashboard/events" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
          Organizer dashboard
        </Link>
      </PageFallback>
    </div>
  );
}
