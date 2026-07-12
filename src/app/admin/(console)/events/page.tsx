import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminOverview } from '@/lib/platform/admin';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminEventsPage() {
  const overview = await getAdminOverview();
  if (!overview) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="All events"
        description="Published and completed markets across organizers (drafts are hidden)"
      />
      <div className="space-y-3">
        {overview.allEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No events yet.</CardContent>
          </Card>
        ) : (
          overview.allEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge variant={event.status === 'published' ? 'success' : 'outline'}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.city} · {formatDate(event.event_date)}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  Stall {formatCurrency(Number(event.stall_fee))}
                  {Number(event.rsvp_entry_fee) > 0 && (
                    <> · RSVP {formatCurrency(Number(event.rsvp_entry_fee))}/guest</>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
