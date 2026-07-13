import { NextResponse } from 'next/server';
import { extractMenuFromImage, isMenuExtractionConfigured } from '@/lib/ai/extract-menu';

const MAX_BYTES = 5 * 1024 * 1024;

function userFacingError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Could not read the menu image. Try a clearer photo or add items manually.';
  }

  const message = error.message
    .replace(/^GEMINI_[A-Z_]+:\d*:/, '')
    .replace(/^GEMINI_[A-Z_]+:/, '')
    .replace(/^GROQ_MODEL_UNAVAILABLE:[^:]+:/, '')
    .replace(/^GROQ_[A-Z_]+:/, '')
    .replace(/^GROQ_FAILED:/, '')
    .trim();

  if (!message) {
    return 'Could not read the menu image. Try a clearer photo or add items manually.';
  }

  if (message.includes('SAFETY') || message.includes('BLOCKED')) {
    return 'Image could not be processed. Try a different photo or add items manually.';
  }

  if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate limit')) {
    return `${message} Add GROQ_API_KEY (free at console.groq.com) as a fallback, or use Add Manually.`;
  }

  if (message.includes('No menu items')) {
    return 'No menu items detected. Try a clearer photo or add items manually.';
  }

  if (message.includes('Failed to validate JSON') || message.includes('failed_generation')) {
    return 'Could not read this menu image. Try a clearer photo or use Add Manually.';
  }

  if (message.includes('Could not parse menu JSON')) {
    return 'Menu scan returned invalid data. Try again or add items manually.';
  }

  return message;
}

export async function POST(request: Request) {
  if (!isMenuExtractionConfigured()) {
    return NextResponse.json(
      {
        error:
          'AI extraction not configured. Add GEMINI_API_KEY (aistudio.google.com) or GROQ_API_KEY (console.groq.com), or use Add Manually.',
        items: [],
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Upload a menu image.', items: [] }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB.', items: [] }, { status: 400 });
  }

  const hasImageMime = file.type.startsWith('image/');
  const hasImageExt = /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
  if (!hasImageMime && !hasImageExt) {
    return NextResponse.json({ error: 'File must be an image (JPG, PNG, or WEBP).', items: [] }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');

  try {
    const items = await extractMenuFromImage(base64, file.type || 'image/jpeg', file.name);

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'No items detected. Try a clearer photo or add manually.', items: [] },
        { status: 422 },
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof Error && error.message === 'AI_NOT_CONFIGURED') {
      return NextResponse.json(
        {
          error:
            'AI extraction not configured. Add GEMINI_API_KEY or GROQ_API_KEY, or use Add Manually.',
          items: [],
        },
        { status: 503 },
      );
    }

    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error('[extract-menu]', error.message);
    }

    return NextResponse.json({ error: userFacingError(error), items: [] }, { status: 502 });
  }
}
