'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { consumeQueuedToast } from '@/lib/toast-queue';

/** Shows toasts queued before navigation (login, logout, etc.). */
export function QueuedToastListener() {
  const pathname = usePathname();

  useEffect(() => {
    // Defer until after the destination route has painted
    const id = window.setTimeout(() => {
      const pending = consumeQueuedToast();
      if (!pending) return;
      if (pending.type === 'error') toast.error(pending.message);
      else if (pending.type === 'info') toast.info(pending.message);
      else toast.success(pending.message);
    }, 80);

    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
