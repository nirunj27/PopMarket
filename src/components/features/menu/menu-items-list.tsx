'use client';

import { useCallback, useMemo, useState } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { resolveDishImageUrl, dishImageDataUrl } from '@/lib/food-placeholders';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';

export interface MenuListItem {
  name: string;
  price?: number;
  imageUrl?: string;
}

interface MenuItemsListProps {
  items: MenuListItem[];
  className?: string;
  dense?: boolean;
  /** Larger dish thumbnails + always show food art */
  prominent?: boolean;
}

export function MenuItemsList({
  items,
  className,
  dense = false,
  prominent = false,
}: MenuItemsListProps) {
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());

  const markBroken = useCallback((url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);

  const showImages = prominent || items.some((item) => item.imageUrl);

  const resolvedItems = useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        displaySrc: prominent
          ? dishImageDataUrl(item.name, index)
          : resolveDishImageUrl(
              item.name,
              index,
              item.imageUrl,
              item.imageUrl ? brokenUrls.has(item.imageUrl) : false,
            ),
      })),
    [items, brokenUrls, prominent],
  );

  if (items.length === 0) return null;

  const thumbClass = prominent
    ? 'h-14 w-14 sm:h-16 sm:w-16'
    : dense
      ? 'h-11 w-11'
      : 'h-12 w-12';

  return (
    <>
      <div className={cn('overflow-hidden rounded-lg border border-border/60', className)}>
        <ul className="divide-y divide-border/40">
          {resolvedItems.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className={cn(
                'flex items-center gap-3 even:bg-muted/10',
                dense ? 'px-2 py-1.5' : 'px-3 py-2.5',
              )}
            >
              {(showImages || prominent) && (
                <div
                  className={cn(
                    'shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/20 shadow-sm',
                    thumbClass,
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setPreview({ src: item.displaySrc, title: item.name })}
                    className="h-full w-full cursor-pointer transition-transform hover:scale-[1.03]"
                    aria-label={`Preview ${item.name}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.displaySrc}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      onError={() => item.imageUrl && markBroken(item.imageUrl)}
                    />
                  </button>
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

      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src ?? null}
        title={preview?.title}
      />
    </>
  );
}
