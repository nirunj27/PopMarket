import Link from 'next/link';
import { PageFallback } from '@/components/ui/page-fallback';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export default function DashboardNotFound() {
  return (
    <PageFallback
      variant="notFound"
      title="Not found"
      description="This event or page does not exist in your account."
      homeHref="/dashboard"
    >
      <Link href="/dashboard/events" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
        All events
      </Link>
    </PageFallback>
  );
}
