const TOAST_KEY = 'popmarket_pending_toast';

export type PendingToast = {
  message: string;
  type: 'success' | 'error' | 'info';
};

/** Queue a toast to show after navigation (avoids flash on the old page). */
export function queueToast(message: string, type: PendingToast['type'] = 'success') {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TOAST_KEY, JSON.stringify({ message, type }));
  } catch {
    // ignore
  }
}

export function consumeQueuedToast(): PendingToast | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(TOAST_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(TOAST_KEY);
    return JSON.parse(raw) as PendingToast;
  } catch {
    return null;
  }
}
