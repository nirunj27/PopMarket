import { Resend } from 'resend';
import { isEmailConfigured, normalizeEmailFrom } from '@/lib/env';
import {
  rsvpConfirmationEmail,
  vendorStatusEmail,
  type RsvpEmailData,
  type VendorEmailData,
} from '@/lib/email/templates';

let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!isEmailConfigured()) {
    console.info('[email] Skipped (RESEND_API_KEY or EMAIL_FROM not set):', subject, '→', to);
    return { success: false, skipped: true, error: 'Email not configured' };
  }

  const client = getResend();
  if (!client) {
    return { success: false, skipped: true, error: 'Email client not configured' };
  }

  const from = normalizeEmailFrom(process.env.EMAIL_FROM);
  if (!from) {
    return { success: false, skipped: true, error: 'EMAIL_FROM is invalid' };
  }

  const { data, error } = await client.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('[email] Failed:', error);
    return { success: false, skipped: false, error: error.message };
  }

  console.info('[email] Sent:', subject, '→', to, data?.id ?? '');
  return { success: true, skipped: false };
}

export async function sendRsvpConfirmationEmail(to: string, data: RsvpEmailData) {
  const { subject, html } = rsvpConfirmationEmail(data);
  return sendEmail(to, subject, html);
}

export async function sendVendorStatusEmail(to: string, data: VendorEmailData) {
  const { subject, html } = vendorStatusEmail(data);
  return sendEmail(to, subject, html);
}
