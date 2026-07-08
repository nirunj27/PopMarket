'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getCroppedImageBlob } from '@/lib/image-crop';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (file: File) => void;
}

export function ImageCropDialog({ open, imageSrc, onClose, onCropComplete }: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
      onCropComplete(file);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle>Crop cover image</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Drag to reposition · scroll or use slider to zoom · output 1600×500 banner
          </p>
        </DialogHeader>

        <div className="relative h-72 bg-muted sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 5}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropChange}
          />
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
            aria-label="Zoom"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>

        <DialogFooter className="border-t border-border px-4 py-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleConfirm()} isLoading={isProcessing}>
            Apply crop & upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
