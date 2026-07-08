import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { getAppUrl } from '@/lib/env';
import { VendorPassPrintButton } from '@/components/features/vendors/vendor-pass-print-button';
import { QrCodeDisplay } from '@/components/ui/qr-code-display';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, QrCode, Receipt, ShieldCheck, Truck } from 'lucide-react';

interface VendorPassCardProps {
  businessName: string;
  truckName?: string | null;
  cuisineType: string;
  vendorType: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  city: string;
  stallCode: string;
  amount: number;
  paidAt?: string | null;
  paymentId?: string | null;
  accessToken: string;
}

export function VendorPassCard({
  businessName,
  truckName,
  cuisineType,
  vendorType,
  eventTitle,
  eventDate,
  venueName,
  city,
  stallCode,
  amount,
  paidAt,
  paymentId,
  accessToken,
}: VendorPassCardProps) {
  const passCode = accessToken.slice(0, 8).toUpperCase();
  const txnRef = paymentId?.slice(-12).toUpperCase() ?? passCode;
  const checkInUrl = `${getAppUrl()}/vendor/${accessToken}`;

  return (
    <div className="space-y-3" id="vendor-pass-root">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Vendor pass</p>
          <h2 className="font-display text-lg font-bold">Show at venue entrance</h2>
        </div>
        <VendorPassPrintButton />
      </div>

      <article
        id="vendor-pass"
        className={cn(
          'vendor-pass-print overflow-hidden rounded-xl border border-border bg-card',
        )}
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              <ShieldCheck className="mr-1 h-3 w-3" />
              Verified
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {vendorType === 'food_truck' ? 'Food truck' : 'Food stall'}
            </Badge>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">Ref {passCode}</p>
        </header>

        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3 border-b border-border/70 p-4 lg:border-b-0 lg:border-r">
            <div>
              <h3 className="font-display text-xl font-bold leading-tight">{businessName}</h3>
              {truckName && <p className="text-sm text-muted-foreground">{truckName}</p>}
              <p className="mt-1 text-xs font-medium text-primary">{cuisineType}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <InfoChip icon={CalendarDays} label="Event" value={eventTitle} sub={formatDate(eventDate)} />
              <InfoChip icon={MapPin} label="Venue" value={venueName} sub={city} />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-primary bg-background font-display text-lg font-black text-primary">
                {stallCode}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Assigned bay
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Truck className="h-3 w-3" />
                  Proceed here after check-in
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Receipt className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase">Paid</span>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatCurrency(amount)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {paidAt ? formatDate(paidAt) : 'In full'} · {txnRef}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 p-4 lg:min-w-[180px]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <QrCode className="h-3.5 w-3.5 text-primary" />
              Entry QR
            </div>
            <QrCodeDisplay value={checkInUrl} size={120} label="Scan to verify vendor" />
          </div>
        </div>

        <footer className="border-t border-border/70 px-4 py-2 text-[10px] text-muted-foreground">
          Present this screen or printout at the gate. Do not share this link publicly.
        </footer>
      </article>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2">
      <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="text-sm font-semibold leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
