'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminOrganizerRow } from '@/lib/queries/admin-organizers';
import { deleteOrganizerAction } from '@/lib/actions/platform';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizersTableProps {
  organizers: AdminOrganizerRow[];
}

const billingLabel: Record<AdminOrganizerRow['billingStatus'], string> = {
  due: 'Payment due',
  settled: 'Settled',
  none: 'No billing yet',
};

export function OrganizersTable({ organizers }: OrganizersTableProps) {
  const [deleting, setDeleting] = useState<AdminOrganizerRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const columns = useMemo<DataTableColumn<AdminOrganizerRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Organizer',
        sortable: true,
        getSortValue: (o) => o.full_name,
        getSearchValue: (o) =>
          [o.full_name, o.company_name, o.email, o.phone, o.address, o.city, o.pincode]
            .filter(Boolean)
            .join(' '),
        cell: (o) => (
          <div>
            <p className="font-medium">{o.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {o.company_name || 'No company'}
              {o.city ? ` · ${o.city}` : ''}
            </p>
          </div>
        ),
      },
      {
        id: 'email',
        header: 'Email',
        sortable: true,
        getSortValue: (o) => o.email,
        getSearchValue: (o) => o.email,
        cell: (o) => <span className="text-sm text-muted-foreground">{o.email}</span>,
      },
      {
        id: 'phone',
        header: 'Phone',
        sortable: true,
        getSortValue: (o) => o.phone ?? '',
        getSearchValue: (o) => o.phone ?? '',
        cell: (o) => <span className="text-sm">{o.phone || '—'}</span>,
      },
      {
        id: 'events',
        header: 'Events',
        sortable: true,
        getSortValue: (o) => o.eventCount,
        getSearchValue: (o) => String(o.eventCount),
        cell: (o) => <span className="font-medium">{o.eventCount}</span>,
      },
      {
        id: 'billing',
        header: 'Billing',
        sortable: true,
        getSortValue: (o) => o.billingStatus,
        getSearchValue: (o) => billingLabel[o.billingStatus],
        cell: (o) => (
          <div>
            <Badge
              variant={
                o.billingStatus === 'due'
                  ? 'destructive'
                  : o.billingStatus === 'settled'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {billingLabel[o.billingStatus]}
            </Badge>
            {o.billingStatus === 'due' && (
              <p className="mt-1 text-xs font-medium text-destructive">
                {formatCurrency(o.outstandingCommission)} due
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'joined',
        header: 'Joined',
        sortable: true,
        getSortValue: (o) => new Date(o.created_at).getTime(),
        getSearchValue: (o) => formatDate(o.created_at),
        cell: (o) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(o.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (o) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/organizers/${o.id}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleting(o)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const filters = useMemo(
    () => [
      {
        id: 'billing',
        label: 'Payment',
        options: [
          { value: 'due', label: 'Payment due' },
          { value: 'settled', label: 'Settled' },
          { value: 'none', label: 'No billing yet' },
        ],
        getValue: (o: AdminOrganizerRow) => o.billingStatus,
      },
    ],
    [],
  );

  const confirmDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteOrganizerAction(deleting.id);
      if (!result.success) {
        toast.error(result.error ?? 'Could not delete organizer');
        return;
      }
      toast.success(`${deleting.full_name} deleted`);
      setDeleting(null);
      router.refresh();
    });
  };

  return (
    <>
      <DataTable
        data={organizers}
        columns={columns}
        rowKey={(o) => o.id}
        searchPlaceholder="Search name, email, phone, address…"
        filters={filters}
        pageSize={10}
        emptyMessage="No organizers yet. Clients appear here after they sign up."
        minWidth="960px"
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete organizer?"
        description={
          deleting
            ? `This permanently deletes ${deleting.full_name} (${deleting.email}), their events, and related data. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete organizer"
        variant="destructive"
        isLoading={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
