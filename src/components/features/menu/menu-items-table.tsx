'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { MenuListItem } from '@/components/features/menu/menu-items-list';

interface MenuRow extends MenuListItem {
  rowId: string;
}

interface MenuItemsTableProps {
  items: MenuListItem[];
  pageSize?: number;
}

export function MenuItemsTable({ items, pageSize = 8 }: MenuItemsTableProps) {
  const rows = useMemo(
    () => items.map((item, index) => ({ ...item, rowId: `${item.name}-${index}` })),
    [items],
  );

  const columns = useMemo<DataTableColumn<MenuRow>[]>(
    () => [
      {
        id: 'name',
        header: 'Item',
        sortable: true,
        getSortValue: (item) => item.name,
        getSearchValue: (item) => item.name,
        cell: (item) => <span className="font-medium">{item.name}</span>,
      },
      {
        id: 'price',
        header: 'Price',
        sortable: true,
        className: 'text-right',
        getSortValue: (item) => item.price ?? 0,
        getSearchValue: (item) => (item.price !== undefined ? String(item.price) : ''),
        cell: (item) => (
          <span className="font-semibold tabular-nums text-primary">
            {item.price !== undefined ? formatCurrency(item.price) : '—'}
          </span>
        ),
      },
    ],
    [],
  );

  if (rows.length === 0) return null;

  return (
    <DataTable
      data={rows}
      columns={columns}
      rowKey={(item) => item.rowId}
      searchPlaceholder="Search menu…"
      pageSize={pageSize}
      emptyMessage="No menu items match your search."
      minWidth="320px"
    />
  );
}
