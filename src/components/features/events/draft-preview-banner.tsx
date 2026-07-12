import Link from 'next/link';
import { Eye } from 'lucide-react';

interface DraftPreviewBannerProps {
  /** Optional link back to organizer dashboard event */
  dashboardHref?: string;
}

/** Shown when an organizer opens public/apply links for an unpublished event. */
export function DraftPreviewBanner({ dashboardHref }: DraftPreviewBannerProps) {
  return (
    <div className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center text-sm text-amber-950">
      <p className="inline-flex flex-wrap items-center justify-center gap-2 font-medium">
        <Eye className="h-4 w-4 shrink-0" />
        <span>
          Draft preview — only you can see this until you publish. Forms are disabled for testing
          layout.
        </span>
        {dashboardHref && (
          <Link href={dashboardHref} className="underline underline-offset-2 hover:no-underline">
            Back to dashboard
          </Link>
        )}
      </p>
    </div>
  );
}
