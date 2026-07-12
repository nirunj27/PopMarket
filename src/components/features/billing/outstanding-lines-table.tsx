'use client';

import { useMemo } from 'react';
import { DataTable, type DataTableColumn, type DataTableFilter } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { CommissionLineItem } from '@/lib/queries/commission';

interface OutstandingLinesTableProps {
  lines: CommissionLineItem[];
  /** Admin detail uses "Fee"; billing uses "Commission" */
  feeHeader?: string;
  showTypeBadge?: boolean;
}

export function OutstandingLinesTable({
  lines,
  feeHeader = 'Commission',
  showTypeBadge = true,
}: OutstandingLinesTableProps) {
  const columns = useMemo<DataTableColumn<CommissionLineItem>[]>(
    () => [
      {
        id: 'type',
        header: 'Type',
        sortable: true,
        getSortValue: (line) => line.source,
        getSearchValue: (line) => (line.source === 'vendor' ? 'vendor' : 'rsvp'),
        cell: (line) =>
          showTypeBadge ? (
            <Badge variant={line.source === 'vendor' ? 'secondary' : 'outline'}>
              {line.source === 'vendor' ? 'Vendor' : 'RSVP'}
            </Badge>
          ) : (
            <span className="capitalize">{line.source}</span>
          ),
      },
      {
        id: 'event',
        header: 'Event',
        sortable: true,
        getSortValue: (line) => line.eventTitle,
        getSearchValue: (line) => line.eventTitle,
        cell: (line) => line.eventTitle,
      },
      {
        id: 'name',
        header: 'Name',
        sortable: true,
        getSortValue: (line) => line.label,
        getSearchValue: (line) => line.label,
        cell: (line) => line.label,
      },
      {
        id: 'gross',
        header: 'Gross',
        sortable: true,
        className: 'text-right',
        getSortValue: (line) => line.gross,
        getSearchValue: (line) => String(line.gross),
        cell: (line) => formatCurrency(line.gross),
      },
      {
        id: 'fee',
        header: feeHeader,
        sortable: true,
        className: 'text-right font-semibold',
        getSortValue: (line) => line.platformFee,
        getSearchValue: (line) => String(line.platformFee),
        cell: (line) => formatCurrency(line.platformFee),
      },
    ],
    [feeHeader, showTypeBadge],
  );

  const filters = useMemo<DataTableFilter<CommissionLineItem>[]>(
    () => [
      {
        id: 'source',
        label: 'Type',
        options: [
          { value: 'vendor', label: 'Vendor' },
          { value: 'rsvp', label: 'RSVP' },
        ],
        getValue: (line) => line.source,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={lines}
      columns={columns}
      rowKey={(line) => `${line.source}-${line.id}`}
      searchPlaceholder="Search name, event, type…"
      filters={filters}
      pageSize={10}
      emptyMessage="No outstanding lines match your search."
      minWidth="640px"
    />
  );
}
