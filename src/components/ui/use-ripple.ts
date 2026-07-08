'use client';

import { useCallback, useRef, type PointerEvent } from 'react';

interface RippleOptions {
  disabled?: boolean;
}

export function useRipple<T extends HTMLElement>(options: RippleOptions = {}) {
  const ref = useRef<T>(null);

  const onPointerDown = useCallback(
    (e: PointerEvent<T>) => {
      if (options.disabled) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    },
    [options.disabled],
  );

  return { ref, onPointerDown };
}
