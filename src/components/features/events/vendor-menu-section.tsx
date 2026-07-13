'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuItemsList } from '@/components/features/menu/menu-items-list';
import { dishImageDataUrl } from '@/lib/food-placeholders';
import { getVendorMenuLines } from '@/lib/menu';
import { cn } from '@/lib/utils';
import { Flame, Sparkles, UtensilsCrossed } from 'lucide-react';

export interface PublicVendorMenu {
  id: string;
  business_name: string;
  cuisine_type: string;
  menu_description: string;
  menu_items?: unknown;
  truck_name?: string | null;
}

const PREVIEW_ITEMS = 8;

export function VendorMenuSection({
  vendors,
  compact = false,
  attractive = false,
}: {
  vendors: PublicVendorMenu[];
  compact?: boolean;
  /** Grid cards with illustrated dish photos — public RSVP pages */
  attractive?: boolean;
}) {
  const [activeCuisine, setActiveCuisine] = useState<string | 'all'>('all');

  const cuisines = useMemo(
    () => [...new Set(vendors.map((v) => v.cuisine_type))],
    [vendors],
  );

  const filteredVendors = useMemo(() => {
    if (activeCuisine === 'all') return vendors;
    return vendors.filter((v) => v.cuisine_type === activeCuisine);
  }, [vendors, activeCuisine]);

  if (vendors.length === 0) return null;

  const useAttractive = attractive || !compact;

  return (
    <Card
      className={cn(
        useAttractive
          ? 'overflow-hidden border-primary/15 bg-gradient-to-b from-primary/[0.04] to-card shadow-sm'
          : compact
            ? 'border-border/70'
            : 'border-border/60',
      )}
    >
      <CardHeader className={cn(useAttractive ? 'space-y-3 px-4 py-4' : compact ? 'space-y-2 py-3 px-4' : 'space-y-2')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <UtensilsCrossed className="h-4 w-4 text-primary" aria-hidden />
            Food lineup
            <Badge variant="secondary" className="text-[10px] font-normal">
              {vendors.length} vendors
            </Badge>
          </CardTitle>
          {useAttractive && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Hurry up &amp; enjoy the feast
            </p>
          )}
        </div>

        {cuisines.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by cuisine">
            <FilterChip active={activeCuisine === 'all'} onClick={() => setActiveCuisine('all')}>
              All
            </FilterChip>
            {cuisines.map((cuisine) => (
              <FilterChip
                key={cuisine}
                active={activeCuisine === cuisine}
                onClick={() => setActiveCuisine(cuisine)}
              >
                {cuisine}
              </FilterChip>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className={cn(useAttractive ? 'px-4 pb-4 pt-0' : compact ? 'space-y-3 px-4 pb-3 pt-0' : 'space-y-3')}>
        {filteredVendors.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">No vendors in this cuisine.</p>
        ) : useAttractive ? (
          <ul
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            role="list"
          >
            {filteredVendors.map((vendor, vendorIndex) => {
              const items = getVendorMenuLines(vendor.menu_items, vendor.menu_description, 20);
              const preview = items.slice(0, PREVIEW_ITEMS);
              const heroSrc = dishImageDataUrl(items[0]?.name ?? vendor.business_name, vendorIndex);

              return (
                <li
                  key={vendor.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:border-primary/25 hover:shadow-md"
                  style={{ animationDelay: `${(vendorIndex % 6) * 60}ms` }}
                >
                  <div className="relative flex gap-3 border-b border-border/50 bg-gradient-to-r from-primary/[0.07] via-card to-secondary/[0.06] p-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroSrc}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold">{vendor.business_name}</p>
                      {vendor.truck_name && (
                        <p className="truncate text-[11px] text-muted-foreground">{vendor.truck_name}</p>
                      )}
                      <Badge
                        variant="outline"
                        className="mt-1.5 border-primary/25 bg-primary/5 text-[10px] text-primary"
                      >
                        {vendor.cuisine_type}
                      </Badge>
                    </div>
                    {vendorIndex < 3 && (
                      <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                        <Flame className="h-2.5 w-2.5" />
                        Hot
                      </span>
                    )}
                  </div>
                  {preview.length > 0 ? (
                    <>
                      <MenuItemsList
                        items={preview}
                        prominent
                        dense
                        className="rounded-none border-0 shadow-none"
                      />
                      {items.length > PREVIEW_ITEMS && (
                        <p className="border-t border-border/40 px-3 py-2 text-center text-[10px] font-medium text-muted-foreground">
                          +{items.length - PREVIEW_ITEMS} more on the menu
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="px-3 py-3 text-xs text-muted-foreground">Menu coming soon</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-3" role="list">
            {filteredVendors.map((vendor) => {
              const items = getVendorMenuLines(vendor.menu_items, vendor.menu_description, 20);

              return (
                <li key={vendor.id} className="rounded-lg border border-border/60 bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{vendor.business_name}</p>
                      {vendor.truck_name && (
                        <p className="truncate text-[11px] text-muted-foreground">{vendor.truck_name}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {vendor.cuisine_type}
                    </Badge>
                  </div>
                  {items.length > 0 ? (
                    <MenuItemsList items={items} dense className="rounded-none border-0" />
                  ) : (
                    <p className="px-3 py-2 text-xs text-muted-foreground">Menu coming soon</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary text-primary-foreground shadow-sm'
          : 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
