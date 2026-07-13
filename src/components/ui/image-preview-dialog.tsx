'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  title?: string;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  src,
  title = 'Image preview',
}: ImagePreviewDialogProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="font-display text-base">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[75vh] items-center justify-center bg-muted/20 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={title}
            className="max-h-[65vh] w-full rounded-lg object-contain shadow-sm"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
