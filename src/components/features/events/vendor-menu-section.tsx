'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuItemsList } from '@/components/features/menu/menu-items-list';
import { getVendorMenuLines } from '@/lib/menu';
import { cn } from '@/lib/utils';
import { UtensilsCrossed } from 'lucide-react';

export interface PublicVendorMenu {
  id: string;
  business_name: string;
  cuisine_type: string;
  menu_description: string;
  menu_items?: unknown;
  truck_name?: string | null;
}

export function VendorMenuSection({
  vendors,
  compact = false,
}: {
  vendors: PublicVendorMenu[];
  compact?: boolean;
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

  return (
    <Card className={cn(compact ? 'border-border/70' : 'border-border/60')}>
      <CardHeader className={compact ? 'space-y-2 py-3 px-4' : 'space-y-2'}>
        <CardTitle className="flex items-center gap-2 text-sm">
          <UtensilsCrossed className="h-4 w-4 text-primary" aria-hidden />
          Food lineup
          <Badge variant="secondary" className="text-[10px] font-normal">
            {vendors.length}
          </Badge>
        </CardTitle>

        {cuisines.length > 1 && (
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by cuisine">
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

      <CardContent className={compact ? 'space-y-3 px-4 pb-3 pt-0' : 'space-y-3'}>
        {filteredVendors.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">No vendors in this cuisine.</p>
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
        'rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
