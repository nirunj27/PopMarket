'use client';

import { calculateFeeBreakdown } from '@/lib/fee-calculator';
import type { StallLayoutCell } from '@/lib/stall-layout';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IndianRupee,
  TrendingUp,
  Truck,
  Store,
  BarChart3,
  Target,
} from 'lucide-react';
import { useState } from 'react';

interface FeeCalculatorProps {
  layout: StallLayoutCell[];
  stallFee: number;
}

export function FeeCalculator({ layout, stallFee }: FeeCalculatorProps) {
  const breakdown = calculateFeeBreakdown(layout, stallFee);
  const [activeScenario, setActiveScenario] = useState('strong');
  const active = breakdown.scenarios.find((s) => s.id === activeScenario) ?? breakdown.scenarios[1];
  const occupancyPct = Math.round(breakdown.occupancyRate * 100);

  return (
    <Card className="overflow-hidden border-secondary/20 shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-secondary/10 via-primary/5 to-transparent pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-secondary" />
            Revenue calculator
          </span>
          <Badge variant="outline" className="text-[10px]">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="rounded-2xl bg-gradient-to-br from-secondary to-secondary/85 p-5 text-secondary-foreground shadow-inner">
          <p className="text-xs font-medium uppercase tracking-widest text-secondary-foreground/70">
            Projected revenue
          </p>
          <p className="mt-1 font-display text-4xl font-bold tracking-tight">
            {formatCurrency(active?.amount ?? 0)}
          </p>
          <p className="mt-1 text-sm text-secondary-foreground/80">
            {active?.label} · {active?.stallsSold} of {breakdown.assignableStalls} stalls
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {breakdown.scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setActiveScenario(scenario.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                activeScenario === scenario.id
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/30',
              )}
            >
              {Math.round(scenario.occupancy * 100)}%
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              Sellable capacity
            </span>
            <span className="font-semibold">{occupancyPct}% of grid</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{breakdown.assignableStalls} sellable</span>
            <span>{breakdown.infrastructureBays + breakdown.blockedBays} non-revenue</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5 text-primary" />
              Truck bays
            </div>
            <p className="mt-1 font-bold text-sm">{breakdown.foodTruckBays}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatCurrency(breakdown.truckRevenue)} max
            </p>
          </div>
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Store className="h-3.5 w-3.5 text-secondary" />
              Stall bays
            </div>
            <p className="mt-1 font-bold text-sm">{breakdown.foodStallBays}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatCurrency(breakdown.stallRevenue)} max
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Target className="h-3.5 w-3.5 text-primary" />
              Fee per stall
            </span>
            <span className="font-semibold">{formatCurrency(breakdown.feePerStall)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              Full sell-out
            </span>
            <span className="font-display font-bold text-success">
              {formatCurrency(breakdown.maxRevenue)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
