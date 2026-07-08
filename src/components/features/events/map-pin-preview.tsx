'use client';

import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MapPinPreviewProps {
  address?: string;
}

export function MapPinPreview({ address }: MapPinPreviewProps) {
  const hasAddress = Boolean(address?.trim());

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          Map preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Google Maps coming soon</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Live map preview will be added in a future update
          </p>
          {hasAddress && (
            <p className="mt-3 line-clamp-2 rounded-lg bg-card px-3 py-2 text-xs text-muted-foreground border border-border">
              {address}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
