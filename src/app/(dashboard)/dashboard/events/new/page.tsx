import { PageHeader } from '@/components/layout/page-header';
import { SetupBanner } from '@/components/layout/setup-banner';
import { EventForm } from '@/components/forms/event-form';
import { isSupabaseConfigured } from '@/lib/env';
import { getOrganizerBookedDates } from '@/lib/queries/events';
import { PLATFORM_PAUSED_MESSAGE, isPlatformEnabled } from '@/lib/platform/admin';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export default async function NewEventPage() {
  const configured = isSupabaseConfigured();
  const platformOn = configured ? await isPlatformEnabled() : true;
  const bookedDates = configured && platformOn ? await getOrganizerBookedDates() : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {!configured && <SetupBanner />}

      <PageHeader title="Create event" description="Set up a new food truck market" />

      {!platformOn ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm leading-relaxed text-foreground" role="alert">
              {PLATFORM_PAUSED_MESSAGE}
            </p>
            <Link
              href="/dashboard/events"
              className={cn(buttonVariants({ variant: 'outline' }), 'hover-lift')}
            >
              Back to events
            </Link>
          </CardContent>
        </Card>
      ) : (
        <EventForm bookedDates={bookedDates} />
      )}
    </div>
  );
}
