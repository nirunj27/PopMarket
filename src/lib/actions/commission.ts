'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createRazorpayOrder, verifyRazorpaySignature } from '@/lib/payments/razorpay';
import {
  getOrganizerCommissionSummary,
  markCommissionSettled,
} from '@/lib/queries/commission';
import type { ActionResult } from '@/types';

export async function createCommissionPaymentOrderAction(): Promise<
  ActionResult<{ orderId: string; amount: number; keyId: string; settlementId: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Sign in required' };

  const summary = await getOrganizerCommissionSummary(user.id);
  const amount = Math.round(summary.outstandingTotal);

  if (amount < 1) {
    return { success: false, error: 'No platform commission due right now' };
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
    return { success: false, error: 'Online payments are not configured yet' };
  }

  const admin = createAdminClient();

  const { data: settlement, error: insertError } = await admin
    .from('commission_settlements')
    .insert({
      organizer_id: user.id,
      amount,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !settlement) {
    return { success: false, error: insertError?.message ?? 'Could not create settlement' };
  }

  try {
    const order = await createRazorpayOrder(amount, `comm_${settlement.id.slice(0, 8)}`, {
      settlement_id: settlement.id,
      organizer_id: user.id,
      type: 'platform_commission',
    });

    await admin
      .from('commission_settlements')
      .update({ razorpay_order_id: order.id, updated_at: new Date().toISOString() })
      .eq('id', settlement.id);

    return {
      success: true,
      data: {
        orderId: order.id,
        amount,
        keyId,
        settlementId: settlement.id,
      },
    };
  } catch (error) {
    await admin
      .from('commission_settlements')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', settlement.id);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Could not start payment',
    };
  }
}

export async function verifyCommissionPaymentAction(
  settlementId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<ActionResult> {
  if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return { success: false, error: 'Payment verification failed' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Sign in required' };

  const admin = createAdminClient();
  const { data: settlement } = await admin
    .from('commission_settlements')
    .select('id, organizer_id, amount, status')
    .eq('id', settlementId)
    .maybeSingle();

  if (!settlement || settlement.organizer_id !== user.id) {
    return { success: false, error: 'Settlement not found' };
  }

  if (settlement.status === 'paid') {
    return { success: true };
  }

  const now = new Date().toISOString();
  const { error } = await admin
    .from('commission_settlements')
    .update({
      status: 'paid',
      paid_at: now,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      updated_at: now,
    })
    .eq('id', settlementId);

  if (error) return { success: false, error: error.message };

  await markCommissionSettled(user.id, settlementId);

  revalidatePath('/dashboard/billing');
  revalidatePath('/dashboard');
  revalidatePath('/admin');

  return { success: true };
}
