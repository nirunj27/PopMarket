'use client';

import { useLayoutEffect } from 'react';

/** Force single light theme across the app */
export function ThemeSync() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    try {
      localStorage.setItem('theme', 'light');
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
