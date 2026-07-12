'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { PlatformGuide } from '@/components/features/guides/platform-guide';
import { PortalPanel } from '@/components/layout/public-portal-shell';
import { VENDOR_GUIDE } from '@/lib/guides/platform-guides';
import { cn } from '@/lib/utils';

/** Collapsible vendor guide for the public apply page sidebar */
export function VendorApplyGuide() {
  const [open, setOpen] = useState(false);

  return (
    <PortalPanel>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-semibold">Vendor platform guide</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      <p className="mt-1 text-[11px] text-muted-foreground">
        How apply → approve → pay works on PopMarket
      </p>
      {open && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <PlatformGuide guide={VENDOR_GUIDE} compact />
        </div>
      )}
    </PortalPanel>
  );
}
