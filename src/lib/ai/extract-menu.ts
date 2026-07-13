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

function isRecoverableExtractionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('failed to validate json') ||
    msg.includes('failed_generation') ||
    msg.includes('could not parse menu json') ||
    msg.includes('empty_response') ||
    msg.includes('no menu items')
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
      if (isGroqConfigured() && (isQuotaError(error) || isRecoverableExtractionError(error))) {
        return extractMenuItemsWithGroq(imageBase64, mimeType);
      }
      throw error;
    }
  }

  return extractMenuItemsWithGroq(imageBase64, mimeType);
}
