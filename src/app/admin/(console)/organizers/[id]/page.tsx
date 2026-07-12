import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { getOrganizerDetailForAdmin } from '@/lib/queries/admin-organizers';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Mail, MapPin, Phone } from 'lucide-react';
import { DeleteOrganizerButton } from '@/components/features/admin/delete-organizer-button';
import { OutstandingLinesTable } from '@/components/features/billing/outstanding-lines-table';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrganizerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const org = await getOrganizerDetailForAdmin(id);
  if (!org) notFound();

  const billingLabel =
    org.billingStatus === 'due'
      ? 'Payment due'
      : org.billingStatus === 'settled'
        ? 'Settled'
        : 'No billing yet';

  return (
    <div className="space-y-6">
      <Link
        href="/admin/organizers"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to organizers
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={org.full_name}
          description={org.company_name || 'Organizer account'}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={
              org.billingStatus === 'due'
                ? 'destructive'
                : org.billingStatus === 'settled'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {billingLabel}
          </Badge>
          <DeleteOrganizerButton organizerId={org.id} name={org.full_name} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow icon={Mail} label="Email" value={org.email} />
            <DetailRow icon={Phone} label="Phone" value={org.phone || '—'} />
            <DetailRow icon={Phone} label="WhatsApp" value={org.whatsapp || '—'} />
            <DetailRow
              icon={MapPin}
              label="Address"
              value={
                [org.address, org.city, org.pincode].filter(Boolean).join(', ') || '—'
              }
            />
            <DetailRow icon={Building2} label="Company" value={org.company_name || '—'} />
            {org.gstin && <DetailRow icon={Building2} label="GSTIN" value={org.gstin} />}
            {org.website && <DetailRow icon={Mail} label="Website" value={org.website} />}
            {org.about && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  About
                </p>
                <p className="mt-1 text-foreground">{org.about}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Joined {formatDate(org.created_at)} · {org.eventCount} event
              {org.eventCount === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Platform fee rate: <strong>{org.feePercent}%</strong>
            </p>
            <p>
              Outstanding commission:{' '}
              <strong className={org.outstandingCommission > 0 ? 'text-destructive' : ''}>
                {formatCurrency(org.outstandingCommission)}
              </strong>
            </p>
            <p className="text-muted-foreground">
              Last settlement:{' '}
              {org.lastSettlementAt ? formatDate(org.lastSettlementAt) : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outstanding commission lines</CardTitle>
        </CardHeader>
        <CardContent>
          {org.outstandingLines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing due right now.</p>
          ) : (
            <OutstandingLinesTable
              lines={org.outstandingLines}
              feeHeader="Fee"
              showTypeBadge={false}
            />
          )}
        </CardContent>
      </Card>

      {org.settlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settlement history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {org.settlements.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-foreground">{value}</p>
      </div>
    </div>
  );
}
