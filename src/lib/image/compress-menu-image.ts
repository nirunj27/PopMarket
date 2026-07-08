/** Resize/compress menu photos before AI upload to stay within free-tier limits. */
export async function compressMenuImage(
  file: File,
  maxWidth = 1024,
  quality = 0.78,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'menu';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
