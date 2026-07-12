export interface MenuItem {
  name: string;
  price: number;
  imageUrl?: string;
  /** Normalized crop box from AI (0–1). Not persisted after imageUrl is set. */
  box?: { x: number; y: number; w: number; h: number };
}

export function parseMenuItems(raw: unknown): MenuItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = 'name' in item && typeof item.name === 'string' ? item.name.trim() : '';
      const price = parseMenuPrice('price' in item ? item.price : undefined);
      const imageUrl =
        'imageUrl' in item && typeof item.imageUrl === 'string' && item.imageUrl.trim()
          ? item.imageUrl.trim()
          : undefined;
      const boxRaw =
        'box' in item
          ? item.box
          : 'bbox' in item
            ? item.bbox
            : 'region' in item
              ? item.region
              : undefined;
      const box = parseBox(boxRaw);
      if (!name || Number.isNaN(price) || price < 0) return null;
      return {
        name,
        price,
        ...(imageUrl ? { imageUrl } : {}),
        ...(box ? { box } : {}),
      };
    })
    .filter((item): item is MenuItem => item !== null);
}

function parseBox(raw: unknown): MenuItem['box'] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x ?? o.left);
  const y = Number(o.y ?? o.top);
  const w = Number(o.w ?? o.width);
  const h = Number(o.h ?? o.height);
  if ([x, y, w, h].some((n) => Number.isNaN(n) || n < 0)) return undefined;
  if (w <= 0 || h <= 0) return undefined;
  const scale = x > 1.5 || y > 1.5 || w > 1.5 || h > 1.5 ? 100 : 1;
  return {
    x: Math.min(1, Math.max(0, x / scale)),
    y: Math.min(1, Math.max(0, y / scale)),
    w: Math.min(1, Math.max(0, w / scale)),
    h: Math.min(1, Math.max(0, h / scale)),
  };
}

function parseMenuPrice(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/[₹rs.,\s/-]/gi, '').trim();
    const num = Number(cleaned);
    return Number.isNaN(num) ? NaN : num;
  }
  return NaN;
}

export function parseMenuItemsJson(json?: string | null): MenuItem[] {
  if (!json?.trim()) return [];
  try {
    return parseMenuItems(JSON.parse(json));
  } catch {
    return [];
  }
}

const MENU_JSON_MARKER = '\n<!--popmarket-menu:';

export function formatMenuDescription(items: MenuItem[], summary?: string): string {
  const lines = items.map((item) => `${item.name} — ₹${item.price}`);
  const body = lines.join('\n');
  const trimmedSummary = summary?.trim();
  let text = '';
  if (trimmedSummary && body) text = `${trimmedSummary}\n\n${body}`;
  else if (body) text = body;
  else text = trimmedSummary ?? '';

  if (items.length > 0) {
    // Persist name/price/imageUrl only — drop ephemeral AI boxes
    const persistable = items.map(({ name, price, imageUrl }) => ({
      name,
      price,
      ...(imageUrl ? { imageUrl } : {}),
    }));
    text += `${MENU_JSON_MARKER}${JSON.stringify(persistable)}-->`;
  }
  return text;
}

export function extractMenuItemsFromDescription(description?: string | null): MenuItem[] {
  if (!description?.trim()) return [];

  const markerIndex = description.lastIndexOf(MENU_JSON_MARKER);
  if (markerIndex !== -1) {
    const jsonPart = description
      .slice(markerIndex + MENU_JSON_MARKER.length)
      .replace(/-->$/, '');
    try {
      const parsed = parseMenuItems(JSON.parse(jsonPart));
      if (parsed.length > 0) return parsed;
    } catch {
      // fall through
    }
  }

  return menuItemsFromDescription(description);
}

export function stripMenuMarkerForDisplay(description?: string | null): string {
  if (!description) return '';
  const markerIndex = description.lastIndexOf(MENU_JSON_MARKER);
  if (markerIndex === -1) return description.trim();
  return description.slice(0, markerIndex).trim();
}

export function menuItemsFromDescription(description: string): MenuItem[] {
  const clean = stripMenuMarkerForDisplay(description);
  return clean
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)\s*[—–-]\s*₹?\s*(\d+(?:\.\d{1,2})?)\s*$/);
      if (!match) return null;
      return { name: match[1].trim(), price: Number(match[2]) };
    })
    .filter((item): item is MenuItem => item !== null);
}

export function getVendorMenuLines(
  menuItems: unknown,
  menuDescription?: string | null,
  maxItems?: number,
): { name: string; price?: number; imageUrl?: string }[] {
  const applyLimit = <T,>(items: T[]) =>
    maxItems === undefined ? items : items.slice(0, maxItems);

  const structured = parseMenuItems(menuItems);
  if (structured.length > 0) {
    return applyLimit(structured).map((item) => ({
      name: item.name,
      price: item.price,
      ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    }));
  }

  const fromDescription = extractMenuItemsFromDescription(menuDescription);
  if (fromDescription.length > 0) {
    return applyLimit(fromDescription).map((item) => ({
      name: item.name,
      price: item.price,
      ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    }));
  }

  return applyLimit(
    (menuDescription ?? '')
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter(Boolean),
  ).map((line) => ({ name: line }));
}
