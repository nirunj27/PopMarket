import type { ComponentType } from 'react';
import type { Event, Stall } from '@/types';
import { formatDate, formatCurrency, formatTime } from '@/lib/utils';
import { PortalPanel } from '@/components/layout/public-portal-shell';
import { Calendar, Clock, Grid3x3, IndianRupee, MapPin, Truck, Users } from 'lucide-react';

interface EventApplicationInfoProps {
  event: Event;
  stalls: Stall[];
  approvedVendorCount?: number;
}

export function EventApplicationInfo({
  event,
  stalls,
  approvedVendorCount = 0,
}: EventApplicationInfoProps) {
  const assignableStalls = stalls.filter(
    (s) => s.is_available && (s.zone === 'food_truck' || s.zone === 'food_stall'),
  );
  const premiumStalls = assignableStalls.filter((s) => s.is_premium && Number(s.premium_fee) > 0);
  const maxPremiumFee = premiumStalls.reduce(
    (max, s) => Math.max(max, Number(s.premium_fee ?? 0)),
    0,
  );

  return (
    <div className="space-y-2">
      {event.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.cover_image_url}
          alt=""
          className="h-20 w-full rounded-lg border border-border object-cover"
        />
      )}

      <PortalPanel>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Applying to
        </p>
        <h2 className="mb-2 font-display text-sm font-bold leading-tight">{event.title}</h2>
        {event.description && (
          <p className="mb-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
          <StatCell icon={Calendar} label="Date" value={formatDate(event.event_date)} />
          <StatCell
            icon={Clock}
            label="Hours"
            value={`${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}
          />
          <StatCell
            icon={MapPin}
            label="Venue"
            value={event.venue_name}
            sub={event.city}
            className="col-span-2"
          />
          <StatCell
            icon={Grid3x3}
            label="Open bays"
            value={String(assignableStalls.length)}
            sub={`${event.stall_rows}×${event.stall_cols} grid`}
          />
          <StatCell icon={Truck} label="Vendors" value={String(approvedVendorCount)} />
          <StatCell
            icon={Users}
            label="Guests"
            value={event.visitor_capacity.toLocaleString('en-IN')}
          />
          <StatCell
            icon={IndianRupee}
            label="Stall fee"
            value={formatCurrency(Number(event.stall_fee))}
            sub={
              premiumStalls.length > 0
                ? `Premium +${formatCurrency(maxPremiumFee)}`
                : undefined
            }
          />
        </dl>
      </PortalPanel>
    </div>
  );
}

function StatCell({
  icon: Icon,
  label,
  value,
  sub,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`bg-card px-2.5 py-2 ${className ?? ''}`}>
      <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd className="mt-0.5 text-xs font-semibold text-foreground">{value}</dd>
      {sub && <dd className="text-[10px] text-muted-foreground">{sub}</dd>}
    </div>
  );
}
