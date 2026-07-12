import { notFound } from 'next/navigation';
import {
  getEventBySlug,
  getStallsWithAssignments,
  getApprovedVendorsForEvent,
} from '@/lib/queries/events';
import { VendorApplicationForm } from '@/components/forms/vendor-application-form';
import { EventApplicationInfo } from '@/components/features/events/event-application-info';
import { VendorApplyGuide } from '@/components/features/guides/vendor-apply-guide';
import { PublicPortalShell } from '@/components/layout/public-portal-shell';
import { DraftPreviewBanner } from '@/components/features/events/draft-preview-banner';
import { resolveVendorTerms } from '@/lib/vendor-terms';

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const isPreview = Boolean(event.isPreview);

  const [stalls, approvedVendors] = await Promise.all([
    getStallsWithAssignments(event.id),
    getApprovedVendorsForEvent(event.id),
  ]);

  return (
    <main id="main-content" className="flex-1">
      {isPreview && <DraftPreviewBanner dashboardHref={`/dashboard/events/${event.id}`} />}

      <PublicPortalShell
        eyebrow={isPreview ? 'Draft preview · Vendor application' : 'Vendor application'}
        title="Apply for a stall"
        subtitle={
          isPreview
            ? 'Preview how vendors will see this form. Publishing unlocks real applications.'
            : 'Complete all sections — approval, bay assignment, and payment happen after submit.'
        }
        aside={
          <div className="space-y-2">
            <EventApplicationInfo
              event={event}
              stalls={stalls}
              approvedVendorCount={approvedVendors.length}
            />
            <VendorApplyGuide />
          </div>
        }
      >
        <VendorApplicationForm
          eventSlug={slug}
          eventTitle={event.title}
          stalls={stalls}
          baseStallFee={Number(event.stall_fee)}
          vendorTerms={resolveVendorTerms(event.vendor_terms)}
          previewMode={isPreview}
        />
      </PublicPortalShell>
    </main>
  );
}
