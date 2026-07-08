import { notFound } from 'next/navigation';
import {
  getEventBySlug,
  getPublicReadyVendorsForEvent,
  getPaidVendorCountForEvent,
  getStallsWithAssignments,
} from '@/lib/queries/events';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils';
import { RsvpForm } from '@/components/forms/rsvp-form';
import { StallMap } from '@/components/features/stalls/stall-map';
import { VendorMenuSection } from '@/components/features/events/vendor-menu-section';
import { PublicEventComingSoon } from '@/components/features/events/public-event-coming-soon';
import {
  PublicPortalShell,
  PortalPanel,
  PortalStat,
  PortalStatStrip,
} from '@/components/layout/public-portal-shell';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

interface PublicEventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  const supabase = await createClient();

  const [stalls, vendors, paidVendorCount, rsvpResult] = await Promise.all([
    getStallsWithAssignments(event.id),
    getPublicReadyVendorsForEvent(event.id),
    getPaidVendorCountForEvent(event.id),
    supabase
      .from('visitor_rsvps')
      .select('party_size')
      .eq('event_id', event.id)
      .eq('status', 'confirmed'),
  ]);

  if (vendors.length === 0) {
    return (
      <PublicEventComingSoon
        slug={slug}
        title={event.title}
        description={event.description}
        eventDate={event.event_date}
        startTime={event.start_time}
        endTime={event.end_time}
        venueName={event.venue_name}
        city={event.city}
      />
    );
  }

  const confirmedGuests = rsvpResult.data?.reduce((sum, r) => sum + (r.party_size ?? 1), 0) ?? 0;
  const spotsRemaining = Math.max(0, event.visitor_capacity - confirmedGuests);

  return (
    <main id="main-content" className="flex-1">
      {event.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.cover_image_url}
          alt=""
          className="h-24 w-full border-b border-border object-cover sm:h-28"
        />
      )}

      <PublicPortalShell
        eyebrow="Food truck market"
        title={event.title}
        subtitle={event.description ?? undefined}
        aside={
          <div className="space-y-2">
            <PortalPanel title="Reserve your spot">
              <RsvpForm
                eventSlug={slug}
                eventTitle={event.title}
                spotsRemaining={spotsRemaining}
                entryFeePerGuest={Number(event.rsvp_entry_fee ?? 0)}
              />
            </PortalPanel>

            <PortalPanel>
              <p className="mb-2 text-xs text-muted-foreground">Are you a food truck vendor?</p>
              <Link
                href={`/apply/${slug}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
              >
                Apply for a stall
              </Link>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Stall fee: {formatCurrency(Number(event.stall_fee))}
              </p>
            </PortalPanel>
          </div>
        }
        asideWidth="lg"
        asidePosition="right"
      >
        <PortalStatStrip>
          <PortalStat label="Date" value={formatDate(event.event_date)} />
          <PortalStat
            label="Hours"
            value={`${event.start_time?.slice(0, 5)} – ${event.end_time?.slice(0, 5)}`}
          />
          <PortalStat label="Venue" value={`${event.venue_name}, ${event.city}`} />
          <PortalStat label="Vendors" value={`${vendors.length} live · ${paidVendorCount} paid`} highlight />
          <PortalStat label="Spots left" value={spotsRemaining} highlight />
        </PortalStatStrip>

        <div className="max-h-[min(480px,55vh)] overflow-y-auto rounded-lg">
          <VendorMenuSection vendors={vendors} compact />
        </div>

        <PortalPanel title="Market floor plan" noPadding>
          <div className="p-2">
            <StallMap
              eventId={event.id}
              stalls={stalls}
              approvedVendors={vendors}
              editable={false}
              paidVendorCount={paidVendorCount}
              gridRows={event.stall_rows}
              gridCols={event.stall_cols}
            />
          </div>
        </PortalPanel>
      </PublicPortalShell>
    </main>
  );
}
