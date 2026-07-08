'use client';

import { Toaster } from '@/components/ui/sonner';
import { ThemeSync } from '@/components/layout/theme-sync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      {children}
      <Toaster />
    </>
  );
}
