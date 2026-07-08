export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isGoogleMapsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && normalizeEmailFrom(process.env.EMAIL_FROM));
}

export function normalizeEmailFrom(from?: string): string | null {
  if (!from?.trim()) return null;
  const trimmed = from.trim();
  if (trimmed.includes('<') && trimmed.includes('>')) {
    return trimmed.replace(/^([^<]+)</, (_, name: string) => `${name.trim()} <`);
  }
  if (!trimmed.includes('@')) return null;
  return `PopMarket <${trimmed}>`;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  );
}