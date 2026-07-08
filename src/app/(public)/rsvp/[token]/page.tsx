import { notFound } from 'next/navigation';
import { getRsvpByToken, getPublicReadyVendorsForEvent } from '@/lib/queries/events';
import { RsvpConfirmationCard } from '@/components/features/confirmations/rsvp-confirmation-card';

interface RsvpStatusPageProps {
  params: Promise<{ token: string }>;
}

export default async function RsvpStatusPage({ params }: RsvpStatusPageProps) {
  const { token } = await params;
  const rsvp = await getRsvpByToken(token);

  if (!rsvp) notFound();

  const event = rsvp.events as {
    id: string;
    title: string;
    event_date: string;
    venue_name: string;
    venue_address: string;
    city: string;
    start_time: string;
    end_time: string;
    setup_time: string | null;
    description: string | null;
  };

  const vendors = await getPublicReadyVendorsForEvent(event.id);

  return (
    <main id="main-content" className="flex-1">
      <RsvpConfirmationCard
        accessToken={token}
        paymentStatus={rsvp.payment_status ?? 'none'}
        entryFeeAmount={Number(rsvp.entry_fee_amount ?? 0)}
        guestEmail={rsvp.email}
        vendors={vendors}
        details={{
          guestName: rsvp.name,
          partySize: rsvp.party_size,
          status: rsvp.status === 'confirmed' ? 'confirmed' : 'waitlisted',
          eventTitle: event.title,
          eventDate: event.event_date,
          venueName: event.venue_name,
          venueAddress: event.venue_address,
          city: event.city,
          startTime: event.start_time,
          endTime: event.end_time,
          setupTime: event.setup_time,
          description: event.description,
        }}
      />
    </main>
  );
}
