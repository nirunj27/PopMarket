'use client';

import type { StallZone } from '@/types';
import type { StallLayoutCell } from '@/lib/stall-layout';
import { canPlaceZone, countZoneInLayout, MAX_ENTRANCE_CELLS, MAX_STAGE_CELLS } from '@/lib/stall-layout';
import { STALL_ZONE_COLORS, STALL_ZONE_LABELS, STALL_GRID_CANVAS } from '@/lib/constants';
import { stallCodeForCell } from '@/lib/stall-layout';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const PALETTE_ZONES: StallZone[] = [
  'food_truck',
  'food_stall',
  'entrance',
  'stage',
  'blocked',
];

interface StallDesignerProps {
  rows: number;
  cols: number;
  layout: StallLayoutCell[];
  onLayoutChange: (layout: StallLayoutCell[]) => void;
  defaultPremiumFee?: number;
}

export function StallDesigner({
  rows,
  cols,
  layout,
  onLayoutChange,
  defaultPremiumFee = 2000,
}: StallDesignerProps) {
  const [draggedZone, setDraggedZone] = useState<StallZone | null>(null);
  const [selectedZone, setSelectedZone] = useState<StallZone>('food_truck');
  const [premiumMode, setPremiumMode] = useState(false);
  const [premiumFee, setPremiumFee] = useState(defaultPremiumFee);

  const applyZone = (row: number, col: number, zone: StallZone) => {
    onLayoutChange(
      layout.map((cell) => {
        if (cell.row !== row || cell.col !== col) return cell;
        const isAssignable = zone === 'food_truck' || zone === 'food_stall';
        return {
          ...cell,
          zone,
          isPremium: isAssignable ? cell.isPremium : false,
          premiumFee: isAssignable && cell.isPremium ? cell.premiumFee ?? premiumFee : 0,
        };
      }),
    );
  };

  const tryApplyZone = (row: number, col: number, zone: StallZone) => {
    if (!canPlaceZone(layout, row, col, zone)) {
      const label = STALL_ZONE_LABELS[zone];
      const max = zone === 'entrance' ? MAX_ENTRANCE_CELLS : MAX_STAGE_CELLS;
      toast.error(`Maximum ${max} ${label.toLowerCase()} cells allowed on the map`);
      return;
    }
    applyZone(row, col, zone);
  };

  const togglePremium = (row: number, col: number) => {
    onLayoutChange(
      layout.map((cell) => {
        if (cell.row !== row || cell.col !== col) return cell;
        if (cell.zone !== 'food_truck' && cell.zone !== 'food_stall') return cell;
        const nextPremium = !cell.isPremium;
        return {
          ...cell,
          isPremium: nextPremium,
          premiumFee: nextPremium ? premiumFee : 0,
        };
      }),
    );
  };

  const handleDrop = (row: number, col: number) => {
    if (draggedZone) {
      tryApplyZone(row, col, draggedZone);
      setDraggedZone(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Drag zones onto the grid</p>
        <p className="text-xs text-muted-foreground">
          Or select a zone below, then click a cell to paint it. Max {MAX_ENTRANCE_CELLS} entrances
          and {MAX_STAGE_CELLS} stage areas (
          {countZoneInLayout(layout, 'entrance')}/{MAX_ENTRANCE_CELLS} entrance,{' '}
          {countZoneInLayout(layout, 'stage')}/{MAX_STAGE_CELLS} stage).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2">
          {PALETTE_ZONES.map((zone) => (
            <button
              key={zone}
              type="button"
              draggable
              onDragStart={() => setDraggedZone(zone)}
              onDragEnd={() => setDraggedZone(null)}
              onClick={() => {
                setSelectedZone(zone);
                setPremiumMode(false);
              }}
              className={cn(
                'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all cursor-grab active:cursor-grabbing',
                STALL_ZONE_COLORS[zone],
                selectedZone === zone && !premiumMode && 'ring-2 ring-primary ring-offset-2',
              )}
            >
              <GripVertical className="h-3 w-3 opacity-50" />
              {STALL_ZONE_LABELS[zone]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPremiumMode((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all',
            'bg-warning/20 border-warning/40 text-warning',
            premiumMode && 'ring-2 ring-warning ring-offset-2',
          )}
        >
          <Star className="h-3 w-3" />
          Premium spot
        </button>

        {premiumMode && (
          <Input
            label="Premium fee (₹)"
            type="number"
            min={0}
            step={100}
            value={premiumFee}
            onChange={(e) => setPremiumFee(Number(e.target.value) || 0)}
            className="w-36"
          />
        )}
      </div>

      {premiumMode && (
        <p className="text-xs text-muted-foreground">
          Click assignable bays to mark as premium — high foot-traffic spots near entrance/stage
          with extra vendor charge.
        </p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Floor plan designer · {rows}×{cols}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn('overflow-x-auto p-3', STALL_GRID_CANVAS)}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(56px, 1fr))`,
              gap: '6px',
            }}
          >
            {Array.from({ length: rows }).map((_, row) =>
              Array.from({ length: cols }).map((_, col) => {
                const cell = layout.find((c) => c.row === row && c.col === col);
                const zone = cell?.zone ?? 'food_truck';
                const code = stallCodeForCell(row, col);
                const isPremium = cell?.isPremium && (zone === 'food_truck' || zone === 'food_stall');

                return (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    onClick={() =>
                      premiumMode ? togglePremium(row, col) : tryApplyZone(row, col, selectedZone)
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(row, col);
                    }}
                    className={cn(
                      'relative flex min-h-[56px] flex-col items-center justify-center rounded-lg border-2 p-1 text-center transition-all hover:scale-105 hover:shadow-md',
                      STALL_ZONE_COLORS[zone],
                      isPremium && 'ring-2 ring-warning ring-offset-1',
                    )}
                  >
                    {isPremium && (
                      <Star className="absolute right-0.5 top-0.5 h-3 w-3 fill-warning text-warning" />
                    )}
                    <span className="text-[10px] font-bold">{code}</span>
                    <span className="line-clamp-1 text-[8px] opacity-80">
                      {STALL_ZONE_LABELS[zone].split(' ')[0]}
                    </span>
                  </button>
                );
              }),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
