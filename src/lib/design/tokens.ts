/**
 * 8px spacing grid — use Tailwind multiples of 2 (0.5rem = 8px at default scale).
 * CSS custom properties mirror the same scale in globals.css.
 */
export const SPACE = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Base border radius — 12px; cards use rounded-2xl (16px) */
export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
} as const;

/** Animation durations aligned with globals.css */
export const MOTION = {
  fast: 200,
  base: 250,
  slow: 300,
} as const;
