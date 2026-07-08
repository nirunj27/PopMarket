export interface MenuItem {
  name: string;
  price: number;
}

export function parseMenuItems(raw: unknown): MenuItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = 'name' in item && typeof item.name === 'string' ? item.name.trim() : '';
      const price = parseMenuPrice('price' in item ? item.price : undefined);
      if (!name || Number.isNaN(price) || price < 0) return null;
      return { name, price };
    })
    .filter((item): item is MenuItem => item !== null);
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
    text += `${MENU_JSON_MARKER}${JSON.stringify(items)}-->`;
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
): { name: string; price?: number }[] {
  const applyLimit = <T,>(items: T[]) =>
    maxItems === undefined ? items : items.slice(0, maxItems);

  const structured = parseMenuItems(menuItems);
  if (structured.length > 0) {
    return applyLimit(structured).map((item) => ({
      name: item.name,
      price: item.price,
    }));
  }

  const fromDescription = extractMenuItemsFromDescription(menuDescription);
  if (fromDescription.length > 0) {
    return applyLimit(fromDescription).map((item) => ({
      name: item.name,
      price: item.price,
    }));
  }

  return applyLimit(
    (menuDescription ?? '')
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter(Boolean),
  ).map((line) => ({ name: line }));
}
