export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes('is invalid') ||
    lower.includes('not authorized') ||
    lower.includes('email address cannot be used')
  ) {
    return (
      'This email cannot be used for signup yet. Supabase requires custom SMTP for non-team emails. ' +
      'Fix: Supabase Dashboard → Authentication → SMTP Settings (add Resend/SendGrid), ' +
      'or turn off “Confirm email” under Providers → Email for local testing.'
    );
  }

  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many email attempts. Wait a few minutes and try again.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in. Check your inbox for the confirmation link.';
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid email or password. If you just signed up, confirm your email first.';
  }

  if (lower.includes('user already registered')) {
    return 'This email is already registered. Sign in instead.';
  }

  return message;
}
