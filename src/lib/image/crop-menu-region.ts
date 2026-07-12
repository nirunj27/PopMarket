import type { CropArea } from '@/lib/image-crop';
import { getCroppedImageBlob } from '@/lib/image-crop';

export interface NormalizedBox {
  /** Left edge, 0–1 */
  x: number;
  /** Top edge, 0–1 */
  y: number;
  /** Width, 0–1 */
  w: number;
  /** Height, 0–1 */
  h: number;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function parseNormalizedBox(raw: unknown): NormalizedBox | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;

  const x = Number(o.x ?? o.left);
  const y = Number(o.y ?? o.top);
  const w = Number(o.w ?? o.width);
  const h = Number(o.h ?? o.height);

  if ([x, y, w, h].some((n) => Number.isNaN(n))) return undefined;
  if (w <= 0 || h <= 0) return undefined;

  // Accept 0–100 percentages as well as 0–1 fractions
  const scale = x > 1.5 || y > 1.5 || w > 1.5 || h > 1.5 ? 100 : 1;

  const box: NormalizedBox = {
    x: clamp01(x / scale),
    y: clamp01(y / scale),
    w: clamp01(w / scale),
    h: clamp01(h / scale),
  };

  if (box.x + box.w > 1) box.w = 1 - box.x;
  if (box.y + box.h > 1) box.h = 1 - box.y;
  if (box.w < 0.02 || box.h < 0.02) return undefined;

  return box;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Failed to load image')));
    image.src = src;
  });
}

/** Crop a normalized region from a menu card into a square JPEG data URL. */
export async function cropMenuRegionToDataUrl(
  imageSrc: string,
  box: NormalizedBox,
  outputSize = 320,
): Promise<string | null> {
  try {
    const image = await loadImage(imageSrc);
    const pad = 0.04;
    const x = clamp01(box.x - pad) * image.naturalWidth;
    const y = clamp01(box.y - pad) * image.naturalHeight;
    const w = Math.min(image.naturalWidth - x, (box.w + pad * 2) * image.naturalWidth);
    const h = Math.min(image.naturalHeight - y, (box.h + pad * 2) * image.naturalHeight);

    if (w < 8 || h < 8) return null;

    const pixelCrop: CropArea = { x, y, width: w, height: h };
    const blob = await getCroppedImageBlob(
      imageSrc,
      pixelCrop,
      outputSize,
      outputSize,
      'image/jpeg',
    );

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string' ? resolve(reader.result) : resolve(null);
      reader.onerror = () => reject(new Error('Failed to read crop'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
