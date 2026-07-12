'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { reviewApplicationAction } from '@/lib/actions/events';
import { APPLICATION_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/lib/constants';
import type { VendorApplicationWithDetails } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button-variants';
import { getAppUrl } from '@/lib/env';
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Truck,
  Utensils,
  X,
  Zap,
  Droplets,
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationTableProps {
  applications: VendorApplicationWithDetails[];
  eventId: string;
  openBayCount?: number;
}

export function ApplicationTable({
  applications,
  eventId,
  openBayCount = 0,
}: ApplicationTableProps) {
  const [rejectingApp, setRejectingApp] = useState<VendorApplicationWithDetails | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReview = (applicationId: string, status: 'approved' | 'waitlisted' | 'rejected') => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('status', status);
      if (status === 'rejected') formData.append('rejectionReason', rejectionReason);

      const result = await reviewApplicationAction(applicationId, formData);
      if (!result.success) {
        toast.error(result.error ?? 'Failed to update');
        return;
      }

      toast.success(
        status === 'approved'
          ? 'Vendor approved'
          : status === 'waitlisted'
            ? 'Added to waitlist'
            : 'Application rejected',
      );
      setRejectingApp(null);
      setRejectionReason('');
      router.refresh();
    });
  };

  const copyLink = (token: string) => {
    void navigator.clipboard.writeText(`${getAppUrl()}/vendor/${token}`);
    toast.success('Vendor status link copied');
  };

  const columns = useMemo<DataTableColumn<VendorApplicationWithDetails>[]>(
    () => [
      {
        id: 'vendor',
        header: 'Vendor',
        sortable: true,
        getSortValue: (app) => app.business_name,
        getSearchValue: (app) =>
          [app.business_name, app.truck_name, app.owner_name, app.email, app.phone].join(' '),
        cell: (app) => (
          <>
            <p className="font-semibold">{app.business_name}</p>
            <p className="text-xs text-muted-foreground">{app.truck_name ?? app.owner_name}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <Mail className="h-3 w-3" />
                {app.email}
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Phone className="h-3 w-3" />
                {app.phone}
              </span>
            </div>
          </>
        ),
      },
      {
        id: 'type',
        header: 'Type / Cuisine',
        sortable: true,
        getSortValue: (app) => app.cuisine_type,
        getSearchValue: (app) => `${app.vendor_type} ${app.cuisine_type}`,
        cell: (app) => (
          <>
            <p className="font-medium">
              {app.vendor_type === 'food_truck' ? 'Food truck' : 'Stall'}
            </p>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Utensils className="h-3 w-3" />
              {app.cuisine_type}
            </p>
          </>
        ),
      },
      {
        id: 'bay',
        header: 'Bay',
        sortable: true,
        getSortValue: (app) => app.assigned_stall_code ?? app.preferred_stall_code ?? '',
        getSearchValue: (app) => app.assigned_stall_code ?? app.preferred_stall_code ?? '',
        cell: (app) => {
          const bay = app.assigned_stall_code ?? app.preferred_stall_code;
          return bay ? (
            <Badge variant="secondary" className="font-mono font-bold">
              {bay}
              {app.assigned_stall_code ? '' : ' (pref)'}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: 'payment',
        header: 'Payment',
        sortable: true,
        getSortValue: (app) => Number(app.payment?.amount ?? 0),
        getSearchValue: (app) => app.payment?.status ?? '',
        cell: (app) => {
          const payConfig = app.payment
            ? PAYMENT_STATUS_CONFIG[app.payment.status as keyof typeof PAYMENT_STATUS_CONFIG]
            : null;
          return app.payment ? (
            <div>
              <p className="font-semibold">{formatCurrency(Number(app.payment.amount))}</p>
              {payConfig && (
                <Badge className={cn('mt-0.5 text-[10px]', payConfig.color)}>{payConfig.label}</Badge>
              )}
            </div>
          ) : app.status === 'approved' ? (
            <span className="text-xs text-warning">Awaiting</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: 'needs',
        header: 'Needs',
        sortable: true,
        getSortValue: (app) => (app.needs_power ? 1 : 0) + (app.needs_water ? 1 : 0),
        getSearchValue: (app) =>
          [app.needs_power && 'power', app.needs_water && 'water'].filter(Boolean).join(' '),
        cell: (app) => (
          <div className="flex gap-1.5">
            {app.needs_power && (
              <span title="Power" className="rounded bg-warning/15 p-1 text-warning">
                <Zap className="h-3.5 w-3.5" />
              </span>
            )}
            {app.needs_water && (
              <span title="Water" className="rounded bg-sky-500/15 p-1 text-sky-700">
                <Droplets className="h-3.5 w-3.5" />
              </span>
            )}
            {!app.needs_power && !app.needs_water && (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
      {
        id: 'applied',
        header: 'Applied',
        sortable: true,
        getSortValue: (app) => new Date(app.created_at).getTime(),
        getSearchValue: (app) => formatDate(app.created_at),
        cell: (app) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(app.created_at)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        getSortValue: (app) => app.status,
        getSearchValue: (app) => APPLICATION_STATUS_CONFIG[app.status].label,
        cell: (app) => {
          const statusConfig = APPLICATION_STATUS_CONFIG[app.status];
          return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        getSearchValue: () => '',
        cell: (app) => (
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => copyLink(app.access_token)}
              title="Copy status link"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Link
              href={`/vendor/${app.access_token}`}
              target="_blank"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-9 px-3')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {app.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => handleReview(app.id, 'approved')}
                  title="Approve"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="accent"
                  disabled={isPending}
                  onClick={() => handleReview(app.id, 'waitlisted')}
                  title="Waitlist"
                >
                  <Clock className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setRejectingApp(app);
                    setRejectionReason('');
                  }}
                  title="Reject"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
            {app.status === 'waitlisted' && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => handleReview(app.id, 'approved')}
                title="Approve from waitlist"
              >
                <Check className="h-3 w-3" />
                <span className="sr-only">Approve</span>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [isPending],
  );

  const statusFilterOptions = useMemo(
    () =>
      Object.entries(APPLICATION_STATUS_CONFIG).map(([value, cfg]) => ({
        value,
        label: cfg.label,
      })),
    [],
  );

  const filters = useMemo(
    () => [
      {
        id: 'status',
        label: 'Status',
        options: statusFilterOptions,
        getValue: (app: VendorApplicationWithDetails) => app.status,
      },
      {
        id: 'vendorType',
        label: 'Type',
        options: [
          { value: 'food_truck', label: 'Food truck' },
          { value: 'food_stall', label: 'Stall' },
        ],
        getValue: (app: VendorApplicationWithDetails) => app.vendor_type,
      },
    ],
    [statusFilterOptions],
  );

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <Truck className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 font-medium">No vendor applications yet</p>
        <p className="text-sm text-muted-foreground">Share your apply link to attract food trucks.</p>
      </div>
    );
  }

  const stats = {
    pending: applications.filter((a) => a.status === 'pending').length,
    waitlisted: applications.filter((a) => a.status === 'waitlisted').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    paid: applications.filter((a) => a.payment?.status === 'paid').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat label="Total" value={applications.length} />
        <MiniStat label="Pending review" value={stats.pending} accent="warning" />
        <MiniStat label="Waitlisted" value={stats.waitlisted} accent="primary" />
        <MiniStat label="Approved" value={stats.approved} accent="success" />
        <MiniStat label="Paid" value={stats.paid} accent="primary" />
      </div>

      {stats.waitlisted > 0 && openBayCount > 0 && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">
            {openBayCount} open bay{openBayCount === 1 ? '' : 's'} · {stats.waitlisted} waitlisted
          </p>
          <p className="mt-1 text-muted-foreground">
            Approve a waitlisted vendor, then assign their bay on the{' '}
            <Link href={`/dashboard/events/${eventId}/stalls`} className="font-medium text-primary">
              stall map
            </Link>
            .
          </p>
        </div>
      )}

      <DataTable
        data={applications}
        columns={columns}
        rowKey={(app) => app.id}
        searchPlaceholder="Search vendors…"
        filters={filters}
        pageSize={10}
        emptyMessage="No applications match your filters."
        minWidth="960px"
      />

      {rejectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => {
              setRejectingApp(null);
              setRejectionReason('');
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <p className="font-display text-lg font-bold">Reject application</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {rejectingApp.business_name} — reason is required
            </p>
            <div className="mt-4">
              <Textarea
                label="Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Let the vendor know why..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRejectingApp(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending || !rejectionReason.trim()}
                onClick={() => handleReview(rejectingApp.id, 'rejected')}
              >
                Confirm rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <MapPin className="mr-1 inline h-3 w-3" />
        Assign bays from{' '}
        <Link href={`/dashboard/events/${eventId}/stalls`} className="text-primary font-medium">
          Stall map
        </Link>{' '}
        · Track payments in{' '}
        <Link href={`/dashboard/events/${eventId}/payments`} className="text-primary font-medium">
          Payment history
        </Link>
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'warning' | 'success' | 'primary';
}) {
  const colors = {
    warning: 'text-warning',
    success: 'text-success',
    primary: 'text-primary',
  };
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn('font-display text-2xl font-bold', accent && colors[accent])}>{value}</p>
    </div>
  );
}
