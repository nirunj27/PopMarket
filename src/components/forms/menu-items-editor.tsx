'use client';

import { useRef, useState, type ReactNode } from 'react';
import type { MenuItem } from '@/lib/menu';
import { compressMenuImage } from '@/lib/image/compress-menu-image';
import { cropMenuRegionToDataUrl } from '@/lib/image/crop-menu-region';
import { Input } from '@/components/ui/input';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { cn } from '@/lib/utils';
import { IndianRupee, Loader2, Plus, Trash2, Upload, Wand2, PenLine } from 'lucide-react';
import { toast } from 'sonner';

type MenuTab = 'ai' | 'manual';

interface MenuItemsEditorProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  error?: string;
}

export function MenuItemsEditor({ items, onChange, error }: MenuItemsEditorProps) {
  const [tab, setTab] = useState<MenuTab>('ai');
  const [extracting, setExtracting] = useState(false);
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateItem = (index: number, patch: Partial<MenuItem>) => {
    const base = items.length > 0 ? items : [{ name: '', price: 0 }];
    onChange(base.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => onChange([...items, { name: '', price: 0 }]);

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleExtract = async (file: File) => {
    setExtracting(true);
    try {
      const compressed = await compressMenuImage(file);
      const previewUrl = URL.createObjectURL(compressed);

      const formData = new FormData();
      formData.append('image', compressed);
      const response = await fetch('/api/extract-menu', { method: 'POST', body: formData });
      const data = (await response.json()) as { items?: MenuItem[]; error?: string };

      if (!response.ok || !data.items?.length) {
        URL.revokeObjectURL(previewUrl);
        toast.error(data.error ?? 'Could not extract menu items', { duration: 6000 });
        if (data.error?.toLowerCase().includes('quota')) {
          setTab('manual');
        }
        return;
      }

      // Crop dish photos from the menu card using AI boxes
      const withImages = await Promise.all(
        data.items.map(async (item) => {
          if (!item.box) {
            const { box: _b, ...rest } = item;
            return rest;
          }
          const imageUrl = await cropMenuRegionToDataUrl(previewUrl, item.box);
          const { box: _box, ...rest } = item;
          return imageUrl ? { ...rest, imageUrl } : rest;
        }),
      );

      URL.revokeObjectURL(previewUrl);
      onChange(withImages);

      const photoCount = withImages.filter((i) => i.imageUrl).length;
      toast.success(
        photoCount > 0
          ? `Extracted ${withImages.length} items · ${photoCount} dish photo${photoCount === 1 ? '' : 's'}`
          : `Extracted ${withImages.length} items — review below (no dish photos detected; you can upload Pics)`,
      );
    } catch {
      toast.error('Upload failed. Try again or add items manually.');
    } finally {
      setExtracting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const showList = tab === 'manual' || items.length > 0;
  const listItems = items.length > 0 ? items : tab === 'manual' ? [{ name: '', price: 0 }] : [];

  return (
    <div className="space-y-2">
      <div className="flex gap-1 rounded-lg border border-border/60 bg-muted/20 p-0.5">
        <TabButton active={tab === 'ai'} onClick={() => setTab('ai')} icon={Wand2}>
          AI Extract
        </TabButton>
        <TabButton active={tab === 'manual'} onClick={() => setTab('manual')} icon={PenLine}>
          Add Manually
        </TabButton>
      </div>

      {tab === 'ai' && (
        <label
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border/70 bg-background px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/20',
            extracting && 'pointer-events-none opacity-60',
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={extracting}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleExtract(file);
            }}
          />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {extracting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold">
              {extracting ? 'Reading menu & dish photos…' : 'Upload menu image'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              JPG or PNG · extracts names, prices, and dish pics when present
            </span>
          </span>
        </label>
      )}

      {showList && listItems.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <div className="grid grid-cols-[40px_1fr_88px_32px] gap-2 border-b border-border/60 bg-muted/30 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Pic</span>
            <span>Item</span>
            <span className="text-right">Price</span>
            <span className="sr-only">Remove</span>
          </div>
          <ul role="list">
            {listItems.map((item, index) => (
              <li
                key={index}
                className="grid grid-cols-[40px_1fr_88px_32px] items-center gap-2 border-b border-border/40 px-2 py-1.5 last:border-0 even:bg-muted/10"
              >
                <div className="relative h-9 w-9">
                  {item.imageUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreview({
                          src: item.imageUrl!,
                          title: item.name.trim() || `Item ${index + 1}`,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted/20 transition-colors hover:ring-2 hover:ring-primary/40"
                      aria-label={`Preview photo for ${item.name || `item ${index + 1}`}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  ) : (
                    <label className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/20 hover:border-primary/40">
                      <input
                        ref={(el) => {
                          uploadRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              updateItem(index, { imageUrl: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        aria-label={`Upload photo for item ${index + 1}`}
                      />
                      <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                  )}
                  {item.imageUrl && (
                    <label
                      title="Replace photo"
                      className="absolute -bottom-1 -right-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                    >
                      <input
                        ref={(el) => {
                          uploadRefs.current[index] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              updateItem(index, { imageUrl: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        aria-label={`Replace photo for item ${index + 1}`}
                      />
                      <Upload className="h-2.5 w-2.5 text-muted-foreground" />
                    </label>
                  )}
                </div>
                <Input
                  className="h-8 rounded-md border-border/60 bg-background text-xs"
                  placeholder="Dish name"
                  value={item.name}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                  aria-label={`Item ${index + 1} name`}
                />
                <div className="relative">
                  <IndianRupee className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-8 rounded-md border-border/60 bg-background pl-6 text-right text-xs"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={item.price || ''}
                    onChange={(e) => updateItem(index, { price: Number(e.target.value) || 0 })}
                    aria-label={`Item ${index + 1} price`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => (listItems.length > 1 ? removeItem(index) : undefined)}
                  disabled={listItems.length <= 1}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:invisible"
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/60 bg-muted/15 px-2 py-1.5">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              <Plus className="h-3 w-3" />
              Add item
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src ?? null}
        title={preview?.title}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Wand2;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
