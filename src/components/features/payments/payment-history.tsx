'use client';

import type { EventPaymentRow } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { PaymentHistoryTable } from '@/components/features/payments/payment-history-table';
import { ExportPayoutCsvButton } from '@/components/features/payments/export-payout-csv-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Ticket, Truck, Wallet } from 'lucide-react';

interface PaymentHistoryProps {
  payments: EventPaymentRow[];
  vendorRevenue: number;
  rsvpRevenue: number;
  eventTitle: string;
  eventId: string;
}

export function PaymentHistory({
  payments,
  vendorRevenue,
  rsvpRevenue,
  eventTitle,
  eventId,
}: PaymentHistoryProps) {
  const paid = payments.filter((p) => p.status === 'paid');
  const platformFees = paid.reduce((s, p) => s + p.platform_fee_amount, 0);
  const organizerNet = paid.reduce((s, p) => s + p.organizer_net_amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          icon={IndianRupee}
          label="Gross collected"
          value={formatCurrency(vendorRevenue + rsvpRevenue)}
        />
        <SummaryCard icon={Truck} label="Vendor fees" value={formatCurrency(vendorRevenue)} />
        <SummaryCard icon={Ticket} label="RSVP entries" value={formatCurrency(rsvpRevenue)} />
        <SummaryCard
          icon={Wallet}
          label="Your net (paid)"
          value={formatCurrency(organizerNet)}
        />
        <SummaryCard label="Platform fee" value={formatCurrency(platformFees)} />
        <SummaryCard label="Paid transactions" value={String(paid.length)} accent />
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30">
          <CardTitle className="font-display text-lg">All transactions</CardTitle>
          <ExportPayoutCsvButton
            payments={payments}
            eventTitle={eventTitle}
            eventId={eventId}
          />
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="p-4">
              <PaymentHistoryTable payments={payments} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon?: typeof IndianRupee;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-bold',
          accent ? 'text-primary' : 'text-foreground',
        )}
      >
        {Icon && <Icon className="mr-1 inline h-5 w-5 opacity-70" />}
        {value}
      </p>
    </div>
  );
}
