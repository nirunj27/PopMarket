import { parseMenuItems } from '@/lib/menu';

const MODEL_FALLBACKS = [
  process.env.GROQ_MODEL,
  'qwen/qwen3.6-27b',
  'meta-llama/llama-4-scout-17b-16e-instruct',
].filter((model, index, list): model is string => Boolean(model) && list.indexOf(model) === index);

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

function extractJsonText(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  return raw.trim();
}

function parseGroqError(raw: string): string {
  try {
    const outer = JSON.parse(raw) as { error?: { message?: string } | string };
    let message = '';
    if (typeof outer.error === 'string') {
      try {
        const nested = JSON.parse(outer.error) as { error?: { message?: string } };
        message = nested.error?.message ?? outer.error;
      } catch {
        message = outer.error;
      }
    } else {
      message = outer.error?.message ?? '';
    }

    if (message.includes('decommissioned')) {
      return 'Groq vision model was updated. Restart the dev server and try again.';
    }
    if (message) return message.slice(0, 180);
  } catch {
    if (raw.includes('decommissioned')) {
      return 'Groq vision model was updated. Restart the dev server and try again.';
    }
  }
  return raw.slice(0, 180);
}

async function callGroqModel(
  model: string,
  apiKey: string,
  dataUrl: string,
): Promise<{ name: string; price: number }[]> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract every food menu item and price from this image. Return only JSON: {"items":[{"name":"string","price":number}]}. Prices in INR as plain numbers. Skip headers and non-food lines.',
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
    }),
  });

  const raw = await response.text();

  if (!response.ok) {
    const friendly = parseGroqError(raw);
    if (response.status === 404 || friendly.toLowerCase().includes('decommissioned')) {
      throw new Error(`GROQ_MODEL_UNAVAILABLE:${model}:${friendly}`);
    }
    if (response.status === 429 || raw.toLowerCase().includes('rate limit')) {
      throw new Error('GROQ_QUOTA: Groq free quota exceeded. Use Add Manually or try again later.');
    }
    throw new Error(`GROQ_FAILED:${friendly}`);
  }

  const payload = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = payload.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('GROQ_EMPTY_RESPONSE');
  }

  const parsed = JSON.parse(extractJsonText(text)) as { items?: unknown };
  const items = parseMenuItems(parsed.items);

  if (items.length === 0) {
    throw new Error('No menu items found in image');
  }

  return items;
}

export async function extractMenuItemsWithGroq(
  imageBase64: string,
  mimeType: string,
): Promise<{ name: string; price: number }[]> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GROQ_NOT_CONFIGURED');
  }

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  let lastError = 'Groq request failed';

  for (const model of MODEL_FALLBACKS) {
    try {
      return await callGroqModel(model, apiKey, dataUrl);
    } catch (error) {
      if (error instanceof Error) {
        lastError = error.message.replace(/^GROQ_[A-Z_]+:/, '').trim() || lastError;
        if (error.message.startsWith('GROQ_MODEL_UNAVAILABLE:')) {
          continue;
        }
      }
      throw error instanceof Error ? error : new Error(lastError);
    }
  }

  throw new Error(lastError);
}
