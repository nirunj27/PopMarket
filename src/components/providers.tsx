'use client';

import { Toaster } from '@/components/ui/sonner';
import { ThemeSync } from '@/components/layout/theme-sync';
import { QueuedToastListener } from '@/components/layout/queued-toast-listener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      <QueuedToastListener />
      {children}
      <Toaster />
    </>
  );
}
