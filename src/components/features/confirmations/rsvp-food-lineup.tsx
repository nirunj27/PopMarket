'use client';

import { Badge } from '@/components/ui/badge';
import { MenuItemsList } from '@/components/features/menu/menu-items-list';
import { getVendorMenuLines } from '@/lib/menu';
import type { PublicVendorMenu } from '@/components/features/events/vendor-menu-section';
import { UtensilsCrossed } from 'lucide-react';

/** Food lineup panel for RSVP confirmation page */
export function RsvpFoodLineup({ vendors }: { vendors: PublicVendorMenu[] }) {
  if (vendors.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <UtensilsCrossed className="h-3.5 w-3.5 text-primary" aria-hidden />
          Food lineup
        </h2>
        <Badge variant="secondary" className="text-[10px]">
          {vendors.length} vendors
        </Badge>
      </header>

      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => {
          const items = getVendorMenuLines(vendor.menu_items, vendor.menu_description, 6);

          return (
            <article
              key={vendor.id}
              className="overflow-hidden rounded-lg border border-border/60 bg-background"
            >
              <div className="border-b border-border/50 px-2 py-1.5">
                <p className="text-xs font-semibold text-foreground">{vendor.business_name}</p>
                <p className="text-[10px] text-primary">{vendor.cuisine_type}</p>
              </div>
              {items.length > 0 ? (
                <MenuItemsList items={items} dense className="rounded-none border-0 text-[11px]" />
              ) : (
                <p className="px-2 py-1.5 text-[10px] text-muted-foreground">Menu soon</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
