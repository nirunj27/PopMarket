import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminOverview, getPlatformSettings } from '@/lib/platform/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, IndianRupee, Store, Users } from 'lucide-react';

export default async function AdminOverviewPage() {
  const [overview, settings] = await Promise.all([getAdminOverview(), getPlatformSettings()]);

  if (!overview) {
    return <p className="text-muted-foreground">Unable to load admin data.</p>;
  }

  const stats = [
    {
      label: 'Platform revenue',
      value: formatCurrency(overview.platformRevenue),
      icon: IndianRupee,
      hint: `${settings.platform_fee_percent}% of paid stalls + RSVPs`,
    },
    {
      label: 'Organizer share',
      value: formatCurrency(overview.organizerPayouts),
      icon: Store,
      hint: `Of ${formatCurrency(overview.grossCollected)} collected`,
    },
    {
      label: 'Published events',
      value: String(overview.publishedEvents),
      icon: Calendar,
      hint: `${overview.totalEvents} live markets (no drafts)`,
    },
    {
      label: 'Organizers',
      value: String(overview.organizers.length),
      icon: Users,
      hint: `${overview.paidVendorPayments} paid stalls · ${overview.paidRsvps} paid RSVPs`,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform control"
        description="Earn from organizers via commission on vendor stall fees and RSVP tickets."
      />

      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">How these numbers are calculated</p>
          <p className="mt-2">
            From paid vendor stall fees and paid RSVP tickets on published/completed events only
            (drafts excluded). Platform revenue is PopMarket’s {settings.platform_fee_percent}%
            commission; organizer share is what organizers keep. Guests and vendors pay the
            organizer via Razorpay — commission is settled later from Billing.
          </p>
          <p className="mt-2">
            Example: stall fee ₹5,000 → platform ₹
            {Math.round((5000 * settings.platform_fee_percent) / 100)} · organizer ₹
            {5000 - Math.round((5000 * settings.platform_fee_percent) / 100)}.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-xl font-bold truncate">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.hint}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Upcoming markets</CardTitle>
          <Link href="/admin/events" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.upcomingEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No upcoming published events.</p>
          ) : (
            overview.upcomingEvents.slice(0, 8).map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{event.title}</p>
                    <Badge variant="success">{event.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.city} · {formatDate(event.event_date)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Stall {formatCurrency(Number(event.stall_fee))}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
