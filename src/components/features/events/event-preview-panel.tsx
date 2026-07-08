'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalPanel, PortalStat, PortalStatStrip } from '@/components/layout/public-portal-shell';
import { formatCurrency } from '@/lib/utils';
import { Eye, Ticket } from 'lucide-react';

interface EventPreviewPanelProps {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  venueName?: string;
  city?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  visitorCapacity?: number;
  stallFee?: number;
  rsvpEntryFee?: number;
}

function formatPreviewDate(date?: string) {
  if (!date) return 'Select a date';
  try {
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}

function formatTime(time?: string) {
  if (!time) return '--:--';
  return time.slice(0, 5);
}

export function EventPreviewPanel({
  title,
  description,
  coverImageUrl,
  venueName,
  city,
  eventDate,
  startTime,
  endTime,
  visitorCapacity,
  stallFee,
  rsvpEntryFee = 0,
}: EventPreviewPanelProps) {
  return (
    <Card className="overflow-hidden border-primary/10 shadow-lg">
      <CardHeader className="border-b border-border/60 bg-muted/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="h-4 w-4 text-primary" />
          Public page preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="public-portal bg-[#f3f2ef] text-[#1a1816]">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="" className="h-24 w-full border-b border-border object-cover" />
          ) : (
            <div className="flex h-24 items-center justify-center border-b border-border bg-muted text-xs text-muted-foreground">
              Cover image preview
            </div>
          )}

          <div className="public-portal-sheet px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Food truck market
            </p>
            <h3 className="font-display text-base font-bold leading-tight">
              {title?.trim() || 'Your event title'}
            </h3>
            {description?.trim() ? (
              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{description}</p>
            ) : (
              <p className="mt-1 text-[11px] italic text-muted-foreground">Event description</p>
            )}

            <div className="mt-2">
              <PortalStatStrip>
                <PortalStat label="Date" value={formatPreviewDate(eventDate)} />
                <PortalStat
                  label="Hours"
                  value={`${formatTime(startTime)} – ${formatTime(endTime)}`}
                />
                <PortalStat
                  label="Venue"
                  value={`${venueName?.trim() || 'Venue'}, ${city || 'City'}`}
                />
                <PortalStat label="Vendors" value="Live after publish" />
                <PortalStat label="Spots left" value={String(visitorCapacity || '—')} highlight />
              </PortalStatStrip>
            </div>

            <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_140px]">
              <PortalPanel title="Market floor plan" noPadding>
                <div className="p-2 text-center text-[10px] text-muted-foreground">
                  Interactive stall map appears here
                </div>
              </PortalPanel>

              <PortalPanel title="Reserve your spot">
                <div className="space-y-2 text-[10px]">
                  <div className="h-7 rounded-md bg-muted" />
                  <div className="h-7 rounded-md bg-muted" />
                  <div className="flex h-8 items-center justify-center rounded-md bg-primary/15 font-semibold text-primary">
                    {Number(rsvpEntryFee) > 0
                      ? `Reserve · ${formatCurrency(Number(rsvpEntryFee))} / guest`
                      : 'Reserve my spot'}
                  </div>
                  {Number(rsvpEntryFee) > 0 && (
                    <p className="flex items-center gap-1 text-primary">
                      <Ticket className="h-3 w-3" />
                      Pay via Razorpay after reserve
                    </p>
                  )}
                </div>
              </PortalPanel>
            </div>

            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Stall fee: {formatCurrency(Number(stallFee) || 0)} · Apply link for vendors
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
