'use client';

import type { CSSProperties } from 'react';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      offset={{ top: 58, right: 16 }}
      gap={10}
      visibleToasts={4}
      toastOptions={{
        duration: 4000,
        className: 'sonner-toast-row',
        style: {
          background: 'var(--card)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" strokeWidth={2.25} />,
        info: <InfoIcon className="size-4 text-primary" strokeWidth={2.25} />,
        warning: <TriangleAlertIcon className="size-4 text-warning" strokeWidth={2.25} />,
        error: <OctagonXIcon className="size-4 text-destructive" strokeWidth={2.25} />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'calc(var(--radius) + 2px)',
        } as CSSProperties
      }
      {...props}
    />
  );
}
