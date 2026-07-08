'use client';

import { useState } from 'react';
import { ImagePlus, Loader2, X, Check, AlertCircle, Crop } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { COVER_IMAGE_RULES, validateCoverImageFile } from '@/lib/image-validation';
import { ImageCropDialog } from '@/components/forms/image-crop-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CoverImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
}

export function CoverImageUpload({ value, onChange, error }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState('cover.jpg');

  const uploadFile = async (file: File) => {
    setLocalError(null);
    setImageMeta(null);
    setIsUploading(true);

    try {
      const validation = await validateCoverImageFile(file);
      if (!validation.valid) {
        setLocalError(validation.error ?? 'Invalid image');
        toast.error(validation.error ?? 'Invalid image');
        return;
      }

      setImageMeta({ width: validation.width!, height: validation.height! });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLocalError('You must be signed in to upload images');
        toast.error('You must be signed in to upload images');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('event-covers')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        setLocalError(uploadError.message);
        toast.error(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('event-covers').getPublicUrl(path);

      onChange(publicUrl);
      toast.success(`Cover uploaded (${validation.width}×${validation.height}px)`);
    } catch {
      setLocalError('Failed to upload image');
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > COVER_IMAGE_RULES.maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be under ${COVER_IMAGE_RULES.maxSizeMb}MB`);
      return;
    }

    setPendingFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Cover image</label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Event cover preview" className="h-44 w-full object-cover" />
          {imageMeta && (
            <div className="absolute bottom-2 left-2 rounded-lg bg-background/90 px-2 py-1 text-[10px] font-medium shadow">
              {imageMeta.width}×{imageMeta.height}px
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              onChange('');
              setImageMeta(null);
              setLocalError(null);
            }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-background/90 text-foreground shadow hover:bg-background"
            aria-label="Remove cover image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            'flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors',
            displayError
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <>
              <ImagePlus
                className={cn('h-8 w-8', displayError ? 'text-destructive' : 'text-primary')}
              />
              <span className="text-sm font-medium">Upload hero banner</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Crop className="h-3 w-3" />
                Crop & zoom after selecting
              </span>
            </>
          )}
          <input
            type="file"
            accept={COVER_IMAGE_RULES.acceptedTypes.join(',')}
            className="sr-only"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileSelect(file);
              e.target.value = '';
            }}
          />
        </label>
      )}

      <ul className="grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
        {[
          `JPG, PNG or WebP · max ${COVER_IMAGE_RULES.maxSizeMb}MB`,
          'Crop to 16:5 banner with zoom controls',
          'Min 1200×400px after crop',
          'Shown on public event hero',
        ].map((rule) => (
          <li key={rule} className="flex items-center gap-1.5">
            <Check className="h-3 w-3 shrink-0 text-success" />
            {rule}
          </li>
        ))}
      </ul>

      {displayError && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {displayError}
        </p>
      )}

      {cropSrc && (
        <ImageCropDialog
          open={Boolean(cropSrc)}
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onCropComplete={(file) => {
            setCropSrc(null);
            const named = new File([file], pendingFileName, { type: file.type });
            void uploadFile(named);
          }}
        />
      )}
    </div>
  );
}
