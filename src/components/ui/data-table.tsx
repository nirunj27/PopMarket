'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  sortable?: boolean;
  className?: string;
  getSortValue?: (row: T) => string | number;
  getSearchValue?: (row: T) => string;
  cell: (row: T) => ReactNode;
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  getValue: (row: T) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  filters?: DataTableFilter<T>[];
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  minWidth?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  searchPlaceholder = 'Search…',
  filters = [],
  pageSize = 10,
  emptyMessage = 'No results found.',
  className,
  minWidth = '720px',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortId, setSortId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      if (q) {
        const haystack = columns
          .map((col) => col.getSearchValue?.(row) ?? '')
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      for (const filter of filters) {
        const selected = filterValues[filter.id];
        if (selected && selected !== 'all' && filter.getValue(row) !== selected) return false;
      }
      return true;
    });
  }, [data, search, columns, filters, filterValues]);

  const sorted = useMemo(() => {
    if (!sortId) return filtered;
    const col = columns.find((c) => c.id === sortId);
    if (!col?.getSortValue) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.getSortValue!(a);
      const bv = col.getSortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filtered, sortId, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (colId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortId === colId) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortId(colId);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search table"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.id}
            label={filter.label}
            className="w-full sm:w-40"
            value={filterValues[filter.id] ?? 'all'}
            options={[{ value: 'all', label: 'All' }, ...filter.options]}
            onChange={(e) => {
              setFilterValues((prev) => ({ ...prev, [filter.id]: e.target.value }));
              setPage(1);
            }}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th key={col.id} className={cn('px-4 py-3', col.className)}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id, col.sortable)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {col.header}
                      {sortId === col.id && (
                        <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-muted/20">
                  {columns.map((col) => (
                    <td key={col.id} className={cn('px-4 py-3', col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
