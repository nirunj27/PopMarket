import { createAdminClient } from '@/lib/supabase/admin';
import { calcPlatformSplit } from '@/lib/platform/fees';

export async function getPlatformFeePercent(): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('platform_settings')
    .select('platform_fee_percent')
    .eq('id', 1)
    .maybeSingle();
  return Number(data?.platform_fee_percent ?? 10);
}

export async function ensureVendorPaymentRecord(applicationId: string) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('payments')
    .select('id, amount, status, razorpay_order_id, platform_fee_amount, organizer_net_amount')
    .eq('application_id', applicationId)
    .maybeSingle();

  if (existing) return existing;

  const { data: application } = await supabase
    .from('vendor_applications')
    .select('id, event_id, status, preferred_stall_id, events!inner(stall_fee)')
    .eq('id', applicationId)
    .single();

  if (!application || application.status !== 'approved') return null;

  const event = application.events as unknown as { stall_fee: number };
  let premiumFee = 0;

  if (application.preferred_stall_id) {
    const { data: stall } = await supabase
      .from('stalls')
      .select('is_premium, premium_fee')
      .eq('id', application.preferred_stall_id)
      .maybeSingle();

    if (stall?.is_premium) {
      premiumFee = Number(stall.premium_fee ?? 0);
    }
  }

  const amount = Number(event.stall_fee) + premiumFee;
  const feePercent = await getPlatformFeePercent();
  const { platformFee, organizerNet } = calcPlatformSplit(amount, feePercent);

  const { data: created, error } = await supabase
    .from('payments')
    .insert({
      event_id: application.event_id,
      application_id: applicationId,
      amount,
      platform_fee_amount: platformFee,
      organizer_net_amount: organizerNet,
      status: 'pending',
    })
    .select('id, amount, status, razorpay_order_id, platform_fee_amount, organizer_net_amount')
    .single();

  if (error) {
    console.error('[payments] ensureVendorPaymentRecord failed:', error);
    return null;
  }

  return created;
}
