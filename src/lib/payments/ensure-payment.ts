import { createAdminClient } from '@/lib/supabase/admin';

export async function ensureVendorPaymentRecord(applicationId: string) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('payments')
    .select('id, amount, status, razorpay_order_id')
    .eq('application_id', applicationId)
    .maybeSingle();

  if (existing) return existing;

  const { data: application } = await supabase
    .from('vendor_applications')
    .select(
      'id, event_id, status, preferred_stall_id, events!inner(stall_fee)',
    )
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

  const { data: created, error } = await supabase
    .from('payments')
    .insert({
      event_id: application.event_id,
      application_id: applicationId,
      amount,
      status: 'pending',
    })
    .select('id, amount, status, razorpay_order_id')
    .single();

  if (error) {
    console.error('[payments] ensureVendorPaymentRecord failed:', error);
    return null;
  }

  return created;
}
