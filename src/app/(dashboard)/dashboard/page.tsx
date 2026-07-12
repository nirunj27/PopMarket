import { PageHeader } from '@/components/layout/page-header';
import { SetupBanner } from '@/components/layout/setup-banner';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { getDashboardStats, getEventsForOrganizer } from '@/lib/queries/events';
import { isSupabaseConfigured } from '@/lib/env';
import { PLATFORM_PAUSED_MESSAGE, isPlatformEnabled } from '@/lib/platform/admin';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, Truck, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const [stats, events, platformOn] = configured
    ? await Promise.all([getDashboardStats(), getEventsForOrganizer(), isPlatformEnabled()])
    : [null, [], true];

  const statCards = [
    {
      label: 'Total events',
      value: stats?.totalEvents ?? 0,
      icon: Calendar,
      iconClassName: 'bg-primary/10 text-primary',
    },
    {
      label: 'Published',
      value: stats?.publishedEvents ?? 0,
      icon: Truck,
      iconClassName: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Pending applications',
      value: stats?.pendingApplications ?? 0,
      icon: Clock,
      iconClassName: 'bg-warning/10 text-warning',
    },
    {
      label: 'Visitor RSVPs',
      value: stats?.totalRsvps ?? 0,
      icon: Users,
      iconClassName: 'bg-accent/20 text-accent-foreground',
    },
  ] as const;

  return (
    <div className="space-y-10">
      {!configured && <SetupBanner />}

      <PageHeader
        title="Dashboard"
        description="Overview of your food truck markets"
        action={{ label: 'New event', href: '/dashboard/events/new' }}
        actionDisabled={!platformOn}
        actionMessage={!platformOn ? PLATFORM_PAUSED_MESSAGE : undefined}
      />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <Card className="card-elevated border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Upcoming events</CardTitle>
          <Link
            href="/dashboard/events"
            className="text-sm font-medium text-primary transition-base hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Create your first food truck market to start collecting vendor applications and RSVPs."
              action={{ label: 'Create event', href: '/dashboard/events/new' }}
              actionDisabled={!platformOn}
              actionMessage={!platformOn ? PLATFORM_PAUSED_MESSAGE : undefined}
            />
          ) : (
            <ul className="space-y-3" role="list">
              {events.slice(0, 5).map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 transition-base hover:bg-muted/50 hover-lift sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant={event.status === 'published' ? 'success' : 'outline'}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {event.venue_name}, {event.city} · {formatDate(event.event_date)}
                      </p>
                    </div>
                    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div>
                        <dt className="sr-only">Applications</dt>
                        <dd>{event.application_count} applications</dd>
                      </div>
                      <div>
                        <dt className="sr-only">RSVPs</dt>
                        <dd>{event.rsvp_count} RSVPs</dd>
                      </div>
                      <div>
                        <dt className="sr-only">Stall fee</dt>
                        <dd>{formatCurrency(Number(event.stall_fee))} / stall</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
