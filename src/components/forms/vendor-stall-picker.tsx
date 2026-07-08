'use client';

import { useState } from 'react';
import type { StallWithAssignment } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StallFloorGrid } from '@/components/features/stalls/stall-floor-grid';
import { STALL_ZONE_LABELS } from '@/lib/constants';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VendorStallPickerProps {
  stalls: StallWithAssignment[];
  baseStallFee: number;
  value?: string;
  onChange: (stallId: string) => void;
  error?: string;
}

export function VendorStallPicker({
  stalls,
  baseStallFee,
  value,
  onChange,
  error,
}: VendorStallPickerProps) {
  const [mapOpen, setMapOpen] = useState(true);

  const selectable = stalls.filter(
    (s) =>
      s.is_available &&
      (s.zone === 'food_truck' || s.zone === 'food_stall') &&
      !s.assignment,
  );

  const selected = stalls.find((s) => s.id === value);
  const totalFee =
    baseStallFee + (selected?.is_premium ? Number(selected.premium_fee ?? 0) : 0);

  if (stalls.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Stall map is being finalized. You can still apply — the organizer will assign your bay.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          {selectable.length} open bay{selectable.length === 1 ? '' : 's'} · tap to select
        </p>
        <button
          type="button"
          onClick={() => setMapOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          {mapOpen ? 'Hide map' : 'Show map'}
          <ChevronDown className={cn('h-3 w-3 transition-transform', mapOpen && 'rotate-180')} />
        </button>
      </div>

      {mapOpen && (
        <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
          <StallFloorGrid
            stalls={stalls}
            mode="picker"
            compact
            selectedStallId={value}
            onStallSelect={onChange}
          />
        </div>
      )}

      {selectable.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No open bays — submit anyway and the organizer will assign one.
        </p>
      )}

      {selected && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-display text-sm font-bold">Bay {selected.stall_code}</span>
            <Badge variant="secondary" className="text-[10px]">
              {STALL_ZONE_LABELS[selected.zone]}
            </Badge>
            {selected.is_premium && (
              <Badge variant="warning" className="text-[10px]">
                Premium
              </Badge>
            )}
          </div>
          <span className="font-semibold text-primary">{formatCurrency(totalFee)} est.</span>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
