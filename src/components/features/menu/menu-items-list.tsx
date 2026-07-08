import { formatCurrency, cn } from '@/lib/utils';

export interface MenuListItem {
  name: string;
  price?: number;
}

interface MenuItemsListProps {
  items: MenuListItem[];
  className?: string;
  dense?: boolean;
}

export function MenuItemsList({ items, className, dense = false }: MenuItemsListProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/60', className)}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className={cn('font-semibold', dense ? 'px-2 py-1' : 'px-3 py-1.5')}>Item</th>
            <th className={cn('w-20 text-right font-semibold', dense ? 'px-2 py-1' : 'px-3 py-1.5')}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={`${item.name}-${index}`}
              className="border-b border-border/40 last:border-0 even:bg-muted/10"
            >
              <td className={cn('font-medium text-foreground', dense ? 'px-2 py-1.5' : 'px-3 py-2')}>
                {item.name}
              </td>
              <td
                className={cn(
                  'text-right font-semibold tabular-nums text-primary',
                  dense ? 'px-2 py-1.5' : 'px-3 py-2',
                )}
              >
                {item.price !== undefined ? formatCurrency(item.price) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
