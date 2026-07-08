'use client';

import type { ReactNode } from 'react';
import type { StallWithAssignment } from '@/types';
import {
  STALL_ZONE_COLORS,
  STALL_ZONE_LABELS,
  STALL_STATUS_OVERLAYS,
  STALL_GRID_CANVAS,
  STALL_GRID_PLACEHOLDER,
} from '@/lib/constants';
import { stallCodeForCell } from '@/lib/stall-layout';
import { isStallPaymentLocked } from '@/lib/stalls';
import { cn } from '@/lib/utils';
import { LayoutGrid, Lock, Star } from 'lucide-react';

export type StallGridMode = 'picker' | 'organizer';

interface StallFloorGridProps {
  stalls: StallWithAssignment[];
  mode: StallGridMode;
  selectedStallId?: string | null;
  onStallSelect?: (stallId: string) => void;
  disabled?: boolean;
  compact?: boolean;
  /** Event grid size — used for placeholder when stalls are not generated yet */
  gridRows?: number;
  gridCols?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

function isFoodBay(stall: StallWithAssignment) {
  return stall.zone === 'food_truck' || stall.zone === 'food_stall';
}

function isPaidAndAssigned(stall: StallWithAssignment) {
  return isStallPaymentLocked(stall);
}

function isAssignedUnpaid(stall: StallWithAssignment) {
  return !!stall.assignment?.application && !isStallPaymentLocked(stall);
}

function getSubLabel(stall: StallWithAssignment) {
  const assigned = stall.assignment?.application;
  if (assigned) {
    if (isPaidAndAssigned(stall)) return `Paid · ${assigned.business_name}`;
    return assigned.business_name;
  }
  if (stall.zone === 'entrance') return 'Entry';
  if (stall.zone === 'stage') return 'Stage';
  if (stall.zone === 'blocked') return 'Blocked';
  if (!stall.is_available) return 'Unavailable';
  return 'Open';
}

function StallGridLegend({ compact }: { compact?: boolean }) {
  return (
    <div className={cn('flex flex-wrap gap-2 text-xs', compact && 'gap-1.5 text-[10px]')}>
      {Object.entries(STALL_ZONE_LABELS).map(([zone, label]) => (
        <div key={zone} className="flex items-center gap-1.5">
          <div className={cn('h-3.5 w-3.5 rounded border-2', STALL_ZONE_COLORS[zone])} />
          <span className="font-medium text-muted-foreground">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className={cn('h-3.5 w-3.5 rounded border-2', STALL_STATUS_OVERLAYS.locked)} />
        <span className="font-medium text-muted-foreground">Paid & locked</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
        <span className="font-medium text-muted-foreground">Premium</span>
      </div>
    </div>
  );
}

function StallGridPlaceholder({
  rows,
  cols,
  compact,
}: {
  rows: number;
  cols: number;
  compact?: boolean;
}) {
  const cellSize = compact ? '56px' : '76px';

  return (
    <div
      className={cn('overflow-x-auto', compact ? 'p-2' : 'p-3', STALL_GRID_PLACEHOLDER)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(${cellSize}, 1fr))`,
        gap: compact ? '6px' : '10px',
      }}
    >
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            className={cn(
              'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-background/60 text-center',
              compact ? 'min-h-[56px]' : 'min-h-[76px] rounded-xl p-2',
            )}
          >
            <span className="text-xs font-bold text-muted-foreground">
              {stallCodeForCell(row, col)}
            </span>
          </div>
        )),
      )}
    </div>
  );
}

function StallGridEmptyState({
  title,
  description,
  action,
  gridRows,
  gridCols,
  compact,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  gridRows?: number;
  gridCols?: number;
  compact?: boolean;
}) {
  const showPreview = (gridRows ?? 0) > 0 && (gridCols ?? 0) > 0;

  return (
    <div className={cn('space-y-3', compact ? 'space-y-2' : 'space-y-4')}>
      {showPreview && <StallGridLegend compact={compact} />}
      <div className="rounded-xl border border-border/80 bg-card px-4 py-8 text-center sm:px-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <LayoutGrid className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <p className="font-display text-sm font-bold text-foreground">{title}</p>
        <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
      {showPreview && (
        <StallGridPlaceholder rows={gridRows!} cols={gridCols!} compact={compact} />
      )}
    </div>
  );
}

export function StallFloorGrid({
  stalls,
  mode,
  selectedStallId,
  onStallSelect,
  disabled,
  compact = false,
  gridRows,
  gridCols,
  emptyTitle = 'Floor plan not set up',
  emptyDescription = 'Stall bays have not been generated for this event yet.',
  emptyAction,
}: StallFloorGridProps) {
  if (stalls.length === 0) {
    return (
      <StallGridEmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        gridRows={gridRows}
        gridCols={gridCols}
        compact={compact}
      />
    );
  }

  const maxRow = Math.max(...stalls.map((s) => s.row_index), 0);
  const maxCol = Math.max(...stalls.map((s) => s.col_index), 0);

  const canInteract = (stall: StallWithAssignment) => {
    if (disabled) return false;
    if (isPaidAndAssigned(stall)) return false;

    if (mode === 'picker') {
      return stall.is_available && isFoodBay(stall) && !stall.assignment;
    }

    return (
      stall.is_available &&
      stall.zone !== 'entrance' &&
      stall.zone !== 'stage' &&
      stall.zone !== 'blocked'
    );
  };

  return (
    <div className={cn('space-y-2', compact ? 'space-y-1.5' : 'space-y-3')}>
      <StallGridLegend compact={compact} />

      <div
        className={cn('overflow-x-auto', compact ? 'p-2' : 'p-4', STALL_GRID_CANVAS)}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${maxCol + 1}, minmax(${compact ? '56px' : '76px'}, 1fr))`,
          gap: compact ? '6px' : '10px',
        }}
      >
        {Array.from({ length: maxRow + 1 }).map((_, row) =>
          Array.from({ length: maxCol + 1 }).map((_, col) => {
            const stall = stalls.find((s) => s.row_index === row && s.col_index === col);
            if (!stall) {
              return (
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    'rounded-lg border-2 border-dashed border-stone-600/40 bg-stone-900/30',
                    compact ? 'min-h-[56px]' : 'min-h-[76px]',
                  )}
                />
              );
            }

            const interactive = canInteract(stall);
            const isSelected = selectedStallId === stall.id;
            const paid = isPaidAndAssigned(stall);
            const assigned = isAssignedUnpaid(stall);
            const isPremium = stall.is_premium && Number(stall.premium_fee) > 0;
            const subLabel = getSubLabel(stall);

            return (
              <button
                key={stall.id}
                type="button"
                disabled={!interactive && !assigned && !paid}
                onClick={() => {
                  if (!interactive || !onStallSelect) return;
                  onStallSelect(isSelected ? '' : stall.id);
                }}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-lg border-2 p-1.5 text-center transition-all',
                  compact ? 'min-h-[56px]' : 'min-h-[76px] rounded-xl p-2',
                  STALL_ZONE_COLORS[stall.zone],
                  paid && STALL_STATUS_OVERLAYS.locked,
                  assigned && !paid && STALL_STATUS_OVERLAYS.assigned,
                  isSelected && STALL_STATUS_OVERLAYS.selected,
                  interactive && 'cursor-pointer hover:shadow-lg hover:brightness-105',
                  !interactive && !assigned && !paid && STALL_STATUS_OVERLAYS.unavailable,
                  isPremium && interactive && !isSelected && 'ring-1 ring-warning/60',
                )}
              >
                {paid && (
                  <Lock className="absolute left-1.5 top-1.5 h-3 w-3 text-success" />
                )}
                {isPremium && isFoodBay(stall) && (
                  <Star className="absolute right-1 top-1 h-3 w-3 fill-warning text-warning" />
                )}
                <span className="text-xs font-extrabold tracking-tight">{stall.stall_code}</span>
                <span className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-tight opacity-90">
                  {subLabel}
                </span>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
