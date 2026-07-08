import { getRazorpayClient } from '@/lib/payments/razorpay';

export async function refundRazorpayPayment(
  paymentId: string,
  amountInr?: number,
): Promise<{ success: boolean; error?: string }> {
  const client = getRazorpayClient();
  if (!client) return { success: false, error: 'Razorpay not configured' };

  try {
    await client.payments.refund(paymentId, amountInr ? { amount: Math.round(amountInr * 100) } : {});
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refund failed';
    return { success: false, error: message };
  }
}
