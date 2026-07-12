'use client';

import { useMemo } from 'react';
import type { EventPaymentRow } from '@/types';
import { PAYMENT_STATUS_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

interface PaymentHistoryTableProps {
  payments: EventPaymentRow[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const columns = useMemo<DataTableColumn<EventPaymentRow>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        sortable: true,
        getSortValue: (p) => p.type,
        getSearchValue: (p) => p.type,
        cell: (p) => (
          <Badge variant={p.type === 'vendor' ? 'secondary' : 'outline'}>
            {p.type === 'vendor' ? 'Vendor' : 'RSVP'}
          </Badge>
        ),
      },
      {
        id: 'name',
        header: 'Name',
        sortable: true,
        getSortValue: (p) => p.name,
        getSearchValue: (p) => p.name,
        cell: (p) => <span className="font-medium">{p.name}</span>,
      },
      {
        id: 'email',
        header: 'Email',
        sortable: true,
        getSortValue: (p) => p.email,
        getSearchValue: (p) => p.email,
        cell: (p) => <span className="text-muted-foreground">{p.email}</span>,
      },
      {
        id: 'amount',
        header: 'Gross',
        sortable: true,
        getSortValue: (p) => p.amount,
        getSearchValue: (p) => String(p.amount),
        cell: (p) => <span className="font-semibold">{formatCurrency(p.amount)}</span>,
      },
      {
        id: 'platform_fee',
        header: 'Platform',
        sortable: true,
        getSortValue: (p) => p.platform_fee_amount,
        getSearchValue: (p) => String(p.platform_fee_amount),
        cell: (p) => (
          <span className="text-muted-foreground">{formatCurrency(p.platform_fee_amount)}</span>
        ),
      },
      {
        id: 'organizer_net',
        header: 'Your net',
        sortable: true,
        getSortValue: (p) => p.organizer_net_amount,
        getSearchValue: (p) => String(p.organizer_net_amount),
        cell: (p) => (
          <span className="font-medium text-secondary">{formatCurrency(p.organizer_net_amount)}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        getSortValue: (p) => p.status,
        getSearchValue: (p) => p.status,
        cell: (p) => {
          const cfg =
            PAYMENT_STATUS_CONFIG[p.status as keyof typeof PAYMENT_STATUS_CONFIG] ??
            PAYMENT_STATUS_CONFIG.pending;
          return <Badge className={cfg.color}>{cfg.label}</Badge>;
        },
      },
      {
        id: 'paid_at',
        header: 'Paid',
        sortable: true,
        getSortValue: (p) => (p.paid_at ? new Date(p.paid_at).getTime() : 0),
        getSearchValue: (p) => (p.paid_at ? formatDate(p.paid_at) : ''),
        cell: (p) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {p.paid_at ? formatDate(p.paid_at) : '—'}
          </span>
        ),
      },
      {
        id: 'reference',
        header: 'Razorpay',
        sortable: true,
        getSortValue: (p) => p.razorpay_payment_id ?? p.reference,
        getSearchValue: (p) =>
          [p.razorpay_payment_id, p.razorpay_order_id, p.reference].filter(Boolean).join(' '),
        cell: (p) => (
          <div className="max-w-[140px]">
            <p className="truncate font-mono text-xs" title={p.razorpay_payment_id ?? undefined}>
              {p.razorpay_payment_id ?? p.reference}
            </p>
            {p.razorpay_order_id && (
              <p
                className="truncate font-mono text-[10px] text-muted-foreground"
                title={p.razorpay_order_id}
              >
                {p.razorpay_order_id}
              </p>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const filters = useMemo(
    () => [
      {
        id: 'type',
        label: 'Type',
        options: [
          { value: 'vendor', label: 'Vendor' },
          { value: 'rsvp', label: 'RSVP' },
        ],
        getValue: (p: EventPaymentRow) => p.type,
      },
      {
        id: 'status',
        label: 'Status',
        options: [
          { value: 'paid', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'waived', label: 'Waived' },
        ],
        getValue: (p: EventPaymentRow) => p.status,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={payments}
      columns={columns}
      rowKey={(p) => `${p.type}-${p.id}`}
      searchPlaceholder="Search payments…"
      filters={filters}
      pageSize={15}
      emptyMessage="No payments match your filters."
      minWidth="720px"
    />
  );
}
