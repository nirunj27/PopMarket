import { parseMenuItems } from '@/lib/menu';

const MODEL_FALLBACKS = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
].filter((model, index, list): model is string => Boolean(model) && list.indexOf(model) === index);

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() ?? null;
}

function extractJsonText(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  return raw.trim();
}

function normalizeMimeType(mimeType: string, fileName?: string): string {
  if (mimeType.startsWith('image/')) return mimeType;
  const ext = fileName?.split('.').pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return (ext && byExt[ext]) || 'image/jpeg';
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes(':429:');
}

export function geminiErrorMessage(detail: string): string {
  try {
    const parsed = JSON.parse(detail) as { error?: { message?: string; status?: string } };
    const message = parsed.error?.message ?? '';
    const status = parsed.error?.status ?? '';

    if (message.includes('API key') || status === 'INVALID_ARGUMENT') {
      if (message.toLowerCase().includes('api key')) {
        return 'Invalid Gemini API key. Check GEMINI_API_KEY in .env.local and restart the dev server.';
      }
    }
    if (status === 'NOT_FOUND' || message.includes('not found')) {
      return 'Gemini model not available. Set GEMINI_MODEL=gemini-2.0-flash-lite in .env.local.';
    }
    if (status === 'RESOURCE_EXHAUSTED' || message.toLowerCase().includes('quota')) {
      return 'Gemini free quota exceeded. Add GROQ_API_KEY (free at console.groq.com) for automatic fallback, wait ~1 hour, or use Add Manually.';
    }
    if (message) return message.slice(0, 180);
  } catch {
    // ignore parse errors
  }
  return '';
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Extract every food menu item and price from this image. Return only valid JSON: {"items":[{"name":"string","price":number}]}. Prices must be INR numbers without currency symbols. Skip headers, footers, addresses, and non-food lines. If price is missing for an item, use 0.',
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  let raw = await response.text();

  if (!response.ok && response.status === 400 && raw.includes('responseMimeType')) {
    const retry = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Extract every food menu item and price from this image. Return only valid JSON: {"items":[{"name":"string","price":number}]}. Prices must be INR numbers without currency symbols.',
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.1 },
        }),
      },
    );
    raw = await retry.text();
    if (!retry.ok) {
      const friendly = geminiErrorMessage(raw);
      throw new Error(`GEMINI_REQUEST_FAILED:${retry.status}:${friendly || raw.slice(0, 300)}`);
    }
  } else if (!response.ok) {
    const friendly = geminiErrorMessage(raw);
    throw new Error(`GEMINI_REQUEST_FAILED:${response.status}:${friendly || raw.slice(0, 300)}`);
  }

  const payload = JSON.parse(raw) as {
    candidates?: {
      content?: { parts?: { text?: string }[] };
      finishReason?: string;
    }[];
    promptFeedback?: { blockReason?: string };
  };

  if (payload.promptFeedback?.blockReason) {
    throw new Error(`GEMINI_BLOCKED:${payload.promptFeedback.blockReason}`);
  }

  const candidate = payload.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text ?? '').join('').trim();

  if (!text) {
    const reason = candidate?.finishReason ?? 'unknown';
    throw new Error(`GEMINI_EMPTY_RESPONSE:${reason}`);
  }

  return text;
}

export async function extractMenuItemsFromImage(
  imageBase64: string,
  mimeType: string,
  fileName?: string,
): Promise<{ name: string; price: number }[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const normalizedMime = normalizeMimeType(mimeType, fileName);
  let lastError = 'Gemini request failed';

  for (const model of MODEL_FALLBACKS) {
    try {
      const text = await callGeminiModel(model, apiKey, imageBase64, normalizedMime);
      const parsed = JSON.parse(extractJsonText(text)) as { items?: unknown };
      const items = parseMenuItems(parsed.items);

      if (items.length > 0) {
        return items;
      }

      lastError = 'No menu items found in image';
    } catch (error) {
      if (error instanceof Error) {
        lastError = error.message.replace(/^GEMINI_[A-Z_]+:/, '').trim() || lastError;

        // Only try next model on model-not-found errors
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
          continue;
        }

        if (error.message.startsWith('GEMINI_REQUEST_FAILED:404')) {
          continue;
        }

        if (isQuotaError(error)) {
          throw error;
        }
      }

      throw error instanceof Error ? error : new Error(lastError);
    }
  }

  throw new Error(lastError);
}
