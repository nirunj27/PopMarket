import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { QrCodeDisplay } from '@/components/ui/qr-code-display';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { getAppUrl } from '@/lib/env';
import { RsvpPaymentButton } from '@/components/features/rsvp/rsvp-payment-button';
import { RsvpPassPrintButton } from '@/components/features/confirmations/rsvp-pass-print-button';
import { RsvpFoodLineup } from '@/components/features/confirmations/rsvp-food-lineup';
import type { PublicVendorMenu } from '@/components/features/events/vendor-menu-section';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarDays,
  Clock,
  Hash,
  MapPin,
  Ticket,
  PartyPopper,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';

export interface RsvpConfirmationDetails {
  guestName: string;
  partySize: number;
  status: 'confirmed' | 'waitlisted';
  eventTitle: string;
  eventDate: string;
  venueName: string;
  venueAddress?: string | null;
  city?: string | null;
  startTime: string;
  endTime?: string | null;
  setupTime?: string | null;
  description?: string | null;
}

function formatTime(time?: string | null) {
  if (!time) return null;
  return time.slice(0, 5);
}

export function RsvpConfirmationCard({
  details,
  accessToken,
  paymentStatus = 'none',
  entryFeeAmount = 0,
  guestEmail,
  vendors = [],
}: {
  details: RsvpConfirmationDetails;
  accessToken?: string;
  paymentStatus?: 'none' | 'pending' | 'paid' | 'waived';
  entryFeeAmount?: number;
  guestEmail?: string;
  vendors?: PublicVendorMenu[];
}) {
  const isConfirmed = details.status === 'confirmed';
  const checkInUrl = accessToken ? `${getAppUrl()}/rsvp/${accessToken}` : '';
  const passNumber = accessToken?.slice(0, 8).toUpperCase() ?? '';
  const timeRange = `${formatTime(details.startTime) ?? ''}${details.endTime ? ` – ${formatTime(details.endTime)}` : ''}`;
  const hasFood = vendors.length > 0;

  return (
    <div className="rsvp-status-page mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 sm:py-5">
      <div className="flex flex-col gap-5">
        {/* Top — entry pass */}
        <article
          id="rsvp-pass"
          className={cn(
            'w-full rounded-xl border-2 bg-card shadow-md',
            isConfirmed ? 'border-primary/40' : 'border-warning/50',
          )}
        >
          <header
            className={cn(
              'px-4 py-3 text-primary-foreground',
              isConfirmed
                ? 'bg-gradient-to-r from-primary via-primary to-accent'
                : 'bg-gradient-to-r from-warning to-amber-500',
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {isConfirmed && (
                <Badge className="border-white/30 bg-white/20 text-[10px] text-white hover:bg-white/20">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Entry pass
                </Badge>
              )}
              <Badge className="border-white/30 bg-white/25 text-[10px] text-white hover:bg-white/25">
                {isConfirmed ? 'Confirmed' : 'Waitlist'}
              </Badge>
            </div>
            <h1 className="mt-1.5 font-display text-xl font-bold text-white">
              {isConfirmed ? "You're in!" : "You're on the list"}
            </h1>
          </header>

          {details.description && (
            <div className="border-b border-border bg-gradient-to-br from-accent/40 via-primary/10 to-accent/20 px-4 py-3">
              <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                <Sparkles className="h-3 w-3" aria-hidden />
                About this market
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{details.description}</p>
            </div>
          )}

          {/* QR — centered, full width of pass */}
          <div className="flex flex-col items-center border-b border-primary/15 bg-gradient-to-b from-primary/8 to-background px-4 py-4">
            {isConfirmed && accessToken ? (
              <>
                <div className="rounded-2xl border-2 border-primary/30 bg-white p-2.5 shadow-sm ring-4 ring-primary/10">
                  <QrCodeDisplay
                    value={checkInUrl}
                    size={128}
                    className="[&>div]:border-0 [&>div]:p-0 [&>div]:shadow-none [&_figcaption]:sr-only"
                  />
                </div>
                <p className="mt-2 text-sm font-medium text-primary">Scan at the entrance</p>
              </>
            ) : (
              <div className="flex h-28 w-full max-w-[220px] items-center justify-center rounded-xl border-2 border-dashed border-warning/40 bg-warning/5 px-3 text-center text-sm text-muted-foreground">
                QR code appears when your spot is confirmed
              </div>
            )}

            {passNumber && isConfirmed && (
              <div className="mt-3 w-full max-w-sm rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Pass number
                </p>
                <p className="mt-0.5 font-mono text-base font-bold tracking-widest text-foreground">
                  {passNumber}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  If QR won&apos;t scan, tell staff this number
                </p>
              </div>
            )}
          </div>

          {/* All details — stacked below QR */}
          <dl className="divide-y divide-border px-4 py-1 sm:grid sm:grid-cols-2 sm:divide-y-0 sm:gap-x-4">
            <DetailRow icon={CalendarDays} label="Event" tone="secondary">
              <p className="font-semibold text-foreground">{details.eventTitle}</p>
              <p className="text-sm text-muted-foreground">{formatDate(details.eventDate)}</p>
            </DetailRow>

            <DetailRow icon={Users} label="Guest name" tone="primary">
              <p className="break-words font-semibold text-foreground">{details.guestName}</p>
            </DetailRow>

            <DetailRow icon={Users} label="Party size" tone="primary">
              <p className="font-semibold text-foreground">{details.partySize} guests</p>
            </DetailRow>

            <DetailRow icon={Clock} label="Time" tone="secondary">
              <p className="font-semibold text-foreground">{timeRange || '—'}</p>
              {details.setupTime && (
                <p className="text-sm text-muted-foreground">
                  Setup from {formatTime(details.setupTime)}
                </p>
              )}
            </DetailRow>

            <DetailRow icon={MapPin} label="Venue" tone="accent">
              <p className="font-semibold text-foreground">{details.venueName}</p>
              {details.city && <p className="text-sm text-muted-foreground">{details.city}</p>}
            </DetailRow>

            {details.venueAddress && (
              <DetailRow icon={MapPin} label="Address" tone="accent" className="sm:col-span-2">
                <p className="break-words text-sm leading-relaxed text-foreground">
                  {details.venueAddress}
                </p>
              </DetailRow>
            )}

            {passNumber && !isConfirmed && (
              <DetailRow icon={Hash} label="Waitlist ID" tone="secondary">
                <p className="font-mono font-semibold text-foreground">{passNumber}</p>
                <p className="text-sm text-muted-foreground">Use this to check your status</p>
              </DetailRow>
            )}
          </dl>

          <div className="space-y-2 border-t border-border bg-muted/20 px-4 py-3">
            {isConfirmed && (paymentStatus === 'paid' || paymentStatus === 'none') && accessToken && (
              <div className="flex justify-center">
                <RsvpPassPrintButton />
              </div>
            )}

            {isConfirmed && paymentStatus === 'pending' && entryFeeAmount > 0 && accessToken && guestEmail && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <Ticket className="h-4 w-4" />
                  Entry fee — {formatCurrency(entryFeeAmount)}
                </p>
                <RsvpPaymentButton
                  accessToken={accessToken}
                  amount={entryFeeAmount}
                  guestName={details.guestName}
                  email={guestEmail}
                  eventTitle={details.eventTitle}
                />
              </div>
            )}

            {paymentStatus === 'paid' && (
              <p className="flex items-center justify-center gap-1.5 rounded-md bg-success/15 px-3 py-2 text-sm font-medium text-success">
                <PartyPopper className="h-4 w-4" />
                Entry fee paid
              </p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {isConfirmed
                ? 'Screenshot this page — show the QR or pass number at the gate'
                : 'Check this page if a spot opens up'}
            </p>
          </div>
        </article>

        {/* Below — food lineup grid */}
        {hasFood && <RsvpFoodLineup vendors={vendors} />}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  tone,
  children,
  className,
}: {
  icon: LucideIcon;
  label: string;
  tone: 'primary' | 'secondary' | 'accent';
  children: ReactNode;
  className?: string;
}) {
  const iconBg = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/50 text-amber-800',
  }[tone];

  return (
    <div className={cn('flex gap-3 border-border py-3 sm:border-b sm:last:border-b-0', className)}>
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 space-y-0.5">{children}</dd>
      </div>
    </div>
  );
}
