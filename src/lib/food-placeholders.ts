const PALETTES = [
  { bg: '#fef3e8', plate: '#fde4cc', accent: '#e85d04', detail: '#9a3412' },
  { bg: '#ecfdf5', plate: '#d1fae5', accent: '#2d6a4f', detail: '#14532d' },
  { bg: '#fff7ed', plate: '#ffedd5', accent: '#ea580c', detail: '#c2410c' },
  { bg: '#fef2f2', plate: '#fecaca', accent: '#dc2626', detail: '#991b1b' },
  { bg: '#f5f3ff', plate: '#ede9fe', accent: '#7c3aed', detail: '#5b21b6' },
  { bg: '#ecfeff', plate: '#cffafe', accent: '#0891b2', detail: '#155e75' },
];

const SHAPES = ['bowl', 'plate', 'burger', 'cup'] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function bowlSvg(p: (typeof PALETTES)[number]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="${p.bg}"/>
  <ellipse cx="48" cy="58" rx="32" ry="18" fill="${p.plate}"/>
  <path d="M20 52 Q48 72 76 52" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="48" cy="46" r="14" fill="${p.accent}" opacity="0.9"/>
  <circle cx="42" cy="42" r="3" fill="${p.detail}" opacity="0.5"/>
  <circle cx="54" cy="44" r="2.5" fill="${p.detail}" opacity="0.5"/>
  <rect x="40" y="22" width="16" height="6" rx="3" fill="${p.accent}" opacity="0.35"/>
</svg>`;
}

function plateSvg(p: (typeof PALETTES)[number]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="${p.bg}"/>
  <ellipse cx="48" cy="54" rx="34" ry="22" fill="${p.plate}" stroke="${p.accent}" stroke-width="2"/>
  <ellipse cx="48" cy="48" rx="18" ry="12" fill="${p.accent}" opacity="0.85"/>
  <path d="M34 48 Q48 38 62 48" fill="none" stroke="${p.detail}" stroke-width="2" opacity="0.4"/>
</svg>`;
}

function burgerSvg(p: (typeof PALETTES)[number]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="${p.bg}"/>
  <path d="M26 38 Q48 28 70 38 L68 44 Q48 36 28 44 Z" fill="${p.accent}"/>
  <rect x="28" y="44" width="40" height="6" rx="2" fill="${p.detail}" opacity="0.55"/>
  <rect x="28" y="52" width="40" height="8" rx="3" fill="${p.accent}" opacity="0.75"/>
  <path d="M26 62 Q48 72 70 62 L68 56 Q48 64 28 56 Z" fill="${p.plate}"/>
</svg>`;
}

function cupSvg(p: (typeof PALETTES)[number]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="12" fill="${p.bg}"/>
  <path d="M32 30 L36 68 Q48 74 60 68 L64 30 Z" fill="${p.plate}" stroke="${p.accent}" stroke-width="2"/>
  <ellipse cx="48" cy="30" rx="16" ry="5" fill="${p.accent}" opacity="0.8"/>
  <path d="M64 38 Q76 40 76 48 Q76 54 64 52" fill="none" stroke="${p.accent}" stroke-width="3"/>
</svg>`;
}

const SHAPE_RENDERERS = {
  bowl: bowlSvg,
  plate: plateSvg,
  burger: burgerSvg,
  cup: cupSvg,
};

/** Stable illustrated dish thumbnail — works offline, no broken URLs */
export function dishImageDataUrl(name: string, index = 0): string {
  const hash = hashString(`${name}-${index}`);
  const palette = PALETTES[hash % PALETTES.length];
  const shape = SHAPES[(hash + index) % SHAPES.length];
  return svgDataUrl(SHAPE_RENDERERS[shape](palette));
}

export function resolveDishImageUrl(
  name: string,
  index: number,
  imageUrl?: string,
  broken?: boolean,
): string {
  if (imageUrl && !broken) return imageUrl;
  return dishImageDataUrl(name, index);
}
