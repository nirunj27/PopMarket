'use client';

import { Flame, TrendingUp, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RsvpHypePanelProps {
  spotsRemaining: number;
  capacity: number;
  confirmedGuests: number;
  vendorCount: number;
  entryFeePerGuest?: number;
}

export function RsvpHypePanel({
  spotsRemaining,
  capacity,
  confirmedGuests,
  vendorCount,
  entryFeePerGuest = 0,
}: RsvpHypePanelProps) {
  const fillPercent = capacity > 0 ? Math.min(100, Math.round((confirmedGuests / capacity) * 100)) : 0;
  const isHot = spotsRemaining > 0 && spotsRemaining <= Math.max(20, capacity * 0.25);
  const isAlmostFull = spotsRemaining > 0 && spotsRemaining <= Math.max(8, capacity * 0.08);
  const isFree = entryFeePerGuest <= 0;

  return (
    <div className="space-y-2.5">
      {(isHot || isAlmostFull) && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold',
            isAlmostFull
              ? 'border-destructive/30 bg-destructive/8 text-destructive animate-pulse'
              : 'border-warning/35 bg-warning/10 text-warning',
          )}
        >
          <Flame className="h-4 w-4 shrink-0" />
          {isAlmostFull
            ? 'Almost full — grab your spot now!'
            : 'Filling fast — don’t miss out!'}
        </div>
      )}

      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            {isFree ? 'Free entry — limited seats' : 'Reserve before it sells out'}
          </span>
          <span className="tabular-nums text-muted-foreground">{fillPercent}% full</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
            style={{ width: `${Math.max(fillPercent, 4)}%` }}
          />
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 rounded-md bg-card/80 px-2 py-1.5">
            <Users className="h-3.5 w-3.5 text-secondary" />
            <span>
              <strong className="text-foreground">{confirmedGuests}</strong> going
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-card/80 px-2 py-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>
              <strong className="text-foreground">{vendorCount}</strong> vendors
            </span>
          </div>
        </div>
      </div>

      {spotsRemaining > 0 && (
        <p className="text-center text-[11px] font-medium text-muted-foreground">
          <span className="text-primary">{spotsRemaining}</span> spots left · Hurry up &amp; enjoy
          {vendorCount > 0 && ` · ${vendorCount} food trucks waiting for you`}
        </p>
      )}
    </div>
  );
}
