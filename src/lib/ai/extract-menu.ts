import { extractMenuItemsFromImage, isGeminiConfigured } from '@/lib/ai/gemini';
import { extractMenuItemsWithGroq, isGroqConfigured } from '@/lib/ai/groq';
import type { MenuItem } from '@/lib/menu';

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes(':429:') ||
    msg.includes('rate limit')
  );
}

export function isMenuExtractionConfigured(): boolean {
  return isGeminiConfigured() || isGroqConfigured();
}

export async function extractMenuFromImage(
  imageBase64: string,
  mimeType: string,
  fileName?: string,
): Promise<MenuItem[]> {
  if (!isMenuExtractionConfigured()) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  if (isGeminiConfigured()) {
    try {
      return await extractMenuItemsFromImage(imageBase64, mimeType, fileName);
    } catch (error) {
      if (isQuotaError(error) && isGroqConfigured()) {
        return extractMenuItemsWithGroq(imageBase64, mimeType);
      }
      throw error;
    }
  }

  return extractMenuItemsWithGroq(imageBase64, mimeType);
}
