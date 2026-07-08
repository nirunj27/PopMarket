'use client';

import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}

export function QrCodeDisplay({ value, size = 160, className, label }: QrCodeDisplayProps) {
  return (
    <figure className={cn('flex flex-col items-center gap-2', className)}>
      <div className="rounded-2xl border border-border/60 bg-white p-3 shadow-sm">
        <QRCode
          value={value}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#1c1917"
          aria-label={label ?? 'QR code'}
        />
      </div>
      {label && (
        <figcaption className="text-center text-xs text-muted-foreground">{label}</figcaption>
      )}
    </figure>
  );
}
