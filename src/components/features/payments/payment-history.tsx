import type { EventPaymentRow } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { PaymentHistoryTable } from '@/components/features/payments/payment-history-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Ticket, Truck } from 'lucide-react';

interface PaymentHistoryProps {
  payments: EventPaymentRow[];
  vendorRevenue: number;
  rsvpRevenue: number;
}

export function PaymentHistory({ payments, vendorRevenue, rsvpRevenue }: PaymentHistoryProps) {
  const paidCount = payments.filter((p) => p.status === 'paid').length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={IndianRupee}
          label="Total collected"
          value={formatCurrency(vendorRevenue + rsvpRevenue)}
        />
        <SummaryCard icon={Truck} label="Vendor fees" value={formatCurrency(vendorRevenue)} />
        <SummaryCard icon={Ticket} label="RSVP entries" value={formatCurrency(rsvpRevenue)} />
        <SummaryCard label="Paid transactions" value={String(paidCount)} accent />
      </div>

      <Card className="overflow-hidden rounded-2xl shadow-sm">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="font-display text-lg">All transactions</CardTitle>
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
