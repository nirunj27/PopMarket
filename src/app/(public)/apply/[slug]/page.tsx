import { notFound } from 'next/navigation';
import {
  getEventBySlug,
  getStallsWithAssignments,
  getApprovedVendorsForEvent,
} from '@/lib/queries/events';
import { VendorApplicationForm } from '@/components/forms/vendor-application-form';
import { EventApplicationInfo } from '@/components/features/events/event-application-info';
import { PublicPortalShell } from '@/components/layout/public-portal-shell';
import { resolveVendorTerms } from '@/lib/vendor-terms';

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const [stalls, approvedVendors] = await Promise.all([
    getStallsWithAssignments(event.id),
    getApprovedVendorsForEvent(event.id),
  ]);

  return (
    <main id="main-content" className="flex-1">
      <PublicPortalShell
        eyebrow="Vendor application"
        title="Apply for a stall"
        subtitle="Complete all sections — approval, bay assignment, and payment happen after submit."
        aside={
          <EventApplicationInfo
            event={event}
            stalls={stalls}
            approvedVendorCount={approvedVendors.length}
          />
        }
      >
        <VendorApplicationForm
          eventSlug={slug}
          eventTitle={event.title}
          stalls={stalls}
          baseStallFee={Number(event.stall_fee)}
          vendorTerms={resolveVendorTerms(event.vendor_terms)}
        />
      </PublicPortalShell>
    </main>
  );
}
