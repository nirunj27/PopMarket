export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  outputWidth = 1600,
  outputHeight = 500,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      mimeType,
      0.92,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Failed to load image')));
    image.crossOrigin = 'anonymous';
    image.src = src;
  });
}
