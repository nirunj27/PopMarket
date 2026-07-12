import { formatCurrency, cn } from '@/lib/utils';

export interface MenuListItem {
  name: string;
  price?: number;
  imageUrl?: string;
}

interface MenuItemsListProps {
  items: MenuListItem[];
  className?: string;
  dense?: boolean;
}

export function MenuItemsList({ items, className, dense = false }: MenuItemsListProps) {
  if (items.length === 0) return null;

  const hasImages = items.some((item) => item.imageUrl);

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/60', className)}>
      <ul className="divide-y divide-border/40">
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className={cn(
              'flex items-center gap-3 even:bg-muted/10',
              dense ? 'px-2 py-1.5' : 'px-3 py-2.5',
            )}
          >
            {hasImages && (
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </div>
                )}
              </div>
            )}
            <span className="min-w-0 flex-1 font-medium text-foreground text-xs sm:text-sm">
              {item.name}
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-primary sm:text-sm">
              {item.price !== undefined ? formatCurrency(item.price) : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
