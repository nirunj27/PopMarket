'use client';

import { Flame, PartyPopper, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicEventRsvpHypeProps {
  spotsRemaining: number;
  vendorCount: number;
  entryFeePerGuest: number;
}

export function PublicEventRsvpHype({
  spotsRemaining,
  vendorCount,
  entryFeePerGuest,
}: PublicEventRsvpHypeProps) {
  const isLow = spotsRemaining > 0 && spotsRemaining <= 50;
  const isFree = entryFeePerGuest <= 0;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 text-xs',
        isLow
          ? 'border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10'
          : 'border-secondary/20 bg-gradient-to-r from-secondary/8 to-primary/5',
      )}
    >
      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
        <PartyPopper className="h-3 w-3" />
        Enjoy
      </span>
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{vendorCount} vendors</span> ready to serve
        {isFree ? ' — free entry' : ''}
      </span>
      {isLow && (
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-primary animate-pulse">
          <Flame className="h-3.5 w-3.5" />
          Hurry — only {spotsRemaining} spots left!
        </span>
      )}
      {!isLow && spotsRemaining > 0 && (
        <span className="ml-auto inline-flex items-center gap-1 font-medium text-secondary">
          <Sparkles className="h-3 w-3" />
          {spotsRemaining} spots open
        </span>
      )}
    </div>
  );
}
