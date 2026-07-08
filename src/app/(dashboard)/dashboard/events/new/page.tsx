import { PageHeader } from '@/components/layout/page-header';
import { SetupBanner } from '@/components/layout/setup-banner';
import { EventForm } from '@/components/forms/event-form';
import { isSupabaseConfigured } from '@/lib/env';
import { getOrganizerBookedDates } from '@/lib/queries/events';

export default async function NewEventPage() {
  const configured = isSupabaseConfigured();
  const bookedDates = configured ? await getOrganizerBookedDates() : [];

  return (
    <div className="space-y-8">
      {!configured && <SetupBanner />}

      <PageHeader title="Create event" description="Set up a new food truck market" />
      <EventForm bookedDates={bookedDates} />
    </div>
  );
}
