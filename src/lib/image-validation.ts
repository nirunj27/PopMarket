export const COVER_IMAGE_RULES = {
  maxSizeMb: 5,
  minWidth: 1200,
  minHeight: 400,
  maxWidth: 5000,
  maxHeight: 5000,
  minAspectRatio: 1.5,
  maxAspectRatio: 3.2,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };

    img.src = url;
  });
}

export async function validateCoverImageFile(file: File): Promise<ImageValidationResult> {
  const { maxSizeMb, acceptedTypes, minWidth, minHeight, maxWidth, maxHeight, minAspectRatio, maxAspectRatio } =
    COVER_IMAGE_RULES;

  if (!acceptedTypes.includes(file.type as (typeof acceptedTypes)[number])) {
    return {
      valid: false,
      error: 'Only JPG, PNG, or WebP images are allowed',
    };
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return {
      valid: false,
      error: `Image must be smaller than ${maxSizeMb}MB (yours is ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!COVER_IMAGE_RULES.acceptedExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'Invalid file extension. Use .jpg, .png, or .webp',
    };
  }

  try {
    const { width, height } = await readImageDimensions(file);
    const aspectRatio = width / height;

    if (width < minWidth || height < minHeight) {
      return {
        valid: false,
        error: `Image too small — minimum ${minWidth}×${minHeight}px (yours is ${width}×${height}px)`,
        width,
        height,
      };
    }

    if (width > maxWidth || height > maxHeight) {
      return {
        valid: false,
        error: `Image too large — maximum ${maxWidth}×${maxHeight}px (yours is ${width}×${height}px)`,
        width,
        height,
      };
    }

    if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
      return {
        valid: false,
        error: `Use a wide banner image (ratio between ${minAspectRatio}:1 and ${maxAspectRatio}:1)`,
        width,
        height,
      };
    }

    return { valid: true, width, height };
  } catch {
    return { valid: false, error: 'Could not read image file. Try a different image.' };
  }
}
