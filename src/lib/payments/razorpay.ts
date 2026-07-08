import { createHmac } from 'crypto';
import Razorpay from 'razorpay';
import { isRazorpayConfigured } from '@/lib/env';

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createRazorpayOrder(
  amountInr: number,
  receipt: string,
  notes?: Record<string, string>,
) {
  const client = getRazorpayClient();
  if (!client) throw new Error('Razorpay is not configured');

  return client.orders.create({
    amount: Math.round(amountInr * 100),
    currency: 'INR',
    receipt,
    notes,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');
  return expected === signature;
}
