import { PageHeader } from '@/components/layout/page-header';
import { SetupBanner } from '@/components/layout/setup-banner';
import { EmptyState } from '@/components/ui/empty-state';
import { getEventsForOrganizer } from '@/lib/queries/events';
import { isSupabaseConfigured } from '@/lib/env';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function EventsPage() {
  const configured = isSupabaseConfigured();
  const events = configured ? await getEventsForOrganizer() : [];

  return (
    <div className="space-y-10">
      {!configured && <SetupBanner />}

      <PageHeader
        title="Events"
        description="Manage your food truck markets"
        action={{ label: 'New event', href: '/dashboard/events/new' }}
      />

      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Create your first food truck market to start collecting vendor applications."
          action={{ label: 'Create event', href: '/dashboard/events/new' }}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {events.map((event) => (
            <li key={event.id}>
              <Link href={`/dashboard/events/${event.id}`} className="block h-full">
                <Card className="card-elevated h-full border-border/60 transition-base hover-lift">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-bold leading-tight">
                        {event.title}
                      </h3>
                      <Badge variant={event.status === 'published' ? 'success' : 'outline'}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.venue_name}, {event.city}
                    </p>
                    <p className="text-sm font-medium">{formatDate(event.event_date)}</p>
                    <dl className="flex flex-wrap gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                      <div>
                        <dt className="sr-only">Applications</dt>
                        <dd>{event.application_count} apps</dd>
                      </div>
                      <div>
                        <dt className="sr-only">Approved</dt>
                        <dd>{event.approved_count} approved</dd>
                      </div>
                      <div>
                        <dt className="sr-only">RSVPs</dt>
                        <dd>{event.rsvp_count} RSVPs</dd>
                      </div>
                      <div>
                        <dt className="sr-only">Stall fee</dt>
                        <dd>{formatCurrency(Number(event.stall_fee))}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
