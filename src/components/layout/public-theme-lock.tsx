'use client';

import { useLayoutEffect } from 'react';

/** Public vendor/RSVP pages always use light theme */
export function PublicThemeLock() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');

    root.classList.remove('dark');
    root.classList.add('light');

    return () => {
      try {
        const stored = localStorage.getItem('theme');
        const isDark = stored === 'dark';
        root.classList.toggle('dark', isDark);
        root.classList.toggle('light', stored === 'light' || !isDark);
      } catch {
        if (hadDark) root.classList.add('dark');
      }
    };
  }, []);

  return null;
}
