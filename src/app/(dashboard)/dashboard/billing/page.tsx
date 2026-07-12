import { PageHeader } from '@/components/layout/page-header';
import { PayCommissionButton } from '@/components/features/billing/pay-commission-button';
import { OutstandingLinesTable } from '@/components/features/billing/outstanding-lines-table';
import { getOrganizerCommissionSummary } from '@/lib/queries/commission';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const summary = await getOrganizerCommissionSummary(user.id);
  const meta = user.user_metadata ?? {};
  const name =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    user.email?.split('@')[0] ||
    'Organizer';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform billing"
        description={`PopMarket takes ${summary.feePercent}% commission on paid vendor stall fees and RSVP tickets. Settle what you owe here.`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amount due</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-display text-3xl font-bold">
              {formatCurrency(summary.outstandingTotal)}
            </p>
            <p className="text-sm text-muted-foreground">
              From {summary.outstandingLines.length} unpaid commission line
              {summary.outstandingLines.length === 1 ? '' : 's'} after vendors/guests paid.
            </p>
            <PayCommissionButton
              amount={Math.round(summary.outstandingTotal)}
              organizerName={name}
              email={user.email ?? ''}
            />
            <p className="text-xs text-muted-foreground">
              By paying you settle accrued platform fees under the{' '}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Organizer Terms
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How commission works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Vendors and guests pay full stall / RSVP fees (your revenue).</p>
            <p>2. PopMarket accrues {summary.feePercent}% as platform commission.</p>
            <p>3. You pay that commission to us from this Billing page.</p>
            <p>4. Export payout CSV on each event for your own books.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outstanding lines</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.outstandingLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">You&apos;re all settled — nothing due.</p>
          ) : (
            <OutstandingLinesTable lines={summary.outstandingLines} />
          )}
        </CardContent>
      </Card>

      {summary.settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settlement history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.settlements.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(Number(s.amount))}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.paid_at ? formatDate(s.paid_at) : formatDate(s.created_at)}
                      {s.razorpay_payment_id ? ` · ${s.razorpay_payment_id}` : ''}
                    </p>
                  </div>
                  <Badge variant={s.status === 'paid' ? 'secondary' : 'outline'}>{s.status}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
