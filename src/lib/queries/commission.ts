import { createAdminClient } from '@/lib/supabase/admin';

export interface CommissionLineItem {
  id: string;
  source: 'vendor' | 'rsvp';
  eventId: string;
  eventTitle: string;
  label: string;
  gross: number;
  platformFee: number;
  paidAt: string | null;
}

export interface CommissionSummary {
  outstandingTotal: number;
  outstandingLines: CommissionLineItem[];
  settlements: {
    id: string;
    amount: number;
    status: string;
    paid_at: string | null;
    razorpay_payment_id: string | null;
    created_at: string;
  }[];
  feePercent: number;
}

export async function getOrganizerCommissionSummary(
  organizerId: string,
): Promise<CommissionSummary> {
  const supabase = createAdminClient();

  const [{ data: events }, { data: settings }, { data: settlements }] = await Promise.all([
    supabase.from('events').select('id, title').eq('organizer_id', organizerId),
    supabase.from('platform_settings').select('platform_fee_percent').eq('id', 1).maybeSingle(),
    supabase
      .from('commission_settlements')
      .select('id, amount, status, paid_at, razorpay_payment_id, created_at')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const eventIds = (events ?? []).map((e) => e.id);
  const titleById = new Map((events ?? []).map((e) => [e.id, e.title]));
  const feePercent = Number(settings?.platform_fee_percent ?? 10);

  if (eventIds.length === 0) {
    return {
      outstandingTotal: 0,
      outstandingLines: [],
      settlements: settlements ?? [],
      feePercent,
    };
  }

  const [{ data: vendorPayments }, { data: rsvps }] = await Promise.all([
    supabase
      .from('payments')
      .select(
        'id, event_id, amount, platform_fee_amount, paid_at, commission_settled_at, vendor_applications(business_name)',
      )
      .in('event_id', eventIds)
      .eq('status', 'paid')
      .is('commission_settled_at', null)
      .gt('platform_fee_amount', 0),
    supabase
      .from('visitor_rsvps')
      .select(
        'id, event_id, name, entry_fee_amount, platform_fee_amount, paid_at, commission_settled_at',
      )
      .in('event_id', eventIds)
      .eq('payment_status', 'paid')
      .is('commission_settled_at', null)
      .gt('platform_fee_amount', 0),
  ]);

  const outstandingLines: CommissionLineItem[] = [
    ...(vendorPayments ?? []).map((p) => {
      const rawApp = p.vendor_applications as
        | { business_name: string }
        | { business_name: string }[]
        | null;
      const app = Array.isArray(rawApp) ? rawApp[0] : rawApp;
      return {
        id: p.id,
        source: 'vendor' as const,
        eventId: p.event_id,
        eventTitle: titleById.get(p.event_id) ?? 'Event',
        label: app?.business_name ?? 'Vendor stall',
        gross: Number(p.amount),
        platformFee: Number(p.platform_fee_amount),
        paidAt: p.paid_at,
      };
    }),
    ...(rsvps ?? []).map((r) => ({
      id: r.id,
      source: 'rsvp' as const,
      eventId: r.event_id,
      eventTitle: titleById.get(r.event_id) ?? 'Event',
      label: r.name,
      gross: Number(r.entry_fee_amount),
      platformFee: Number(r.platform_fee_amount),
      paidAt: r.paid_at,
    })),
  ].sort((a, b) => {
    const ta = a.paidAt ? new Date(a.paidAt).getTime() : 0;
    const tb = b.paidAt ? new Date(b.paidAt).getTime() : 0;
    return tb - ta;
  });

  const outstandingTotal = outstandingLines.reduce((s, l) => s + l.platformFee, 0);

  return {
    outstandingTotal,
    outstandingLines,
    settlements: settlements ?? [],
    feePercent,
  };
}

/** Mark all currently outstanding fee rows as settled under a settlement id (service role). */
export async function markCommissionSettled(
  organizerId: string,
  settlementId: string,
): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: events } = await admin
    .from('events')
    .select('id')
    .eq('organizer_id', organizerId);

  const eventIds = (events ?? []).map((e) => e.id);
  if (eventIds.length === 0) return;

  await Promise.all([
    admin
      .from('payments')
      .update({ commission_settled_at: now, commission_settlement_id: settlementId })
      .in('event_id', eventIds)
      .eq('status', 'paid')
      .is('commission_settled_at', null)
      .gt('platform_fee_amount', 0),
    admin
      .from('visitor_rsvps')
      .update({ commission_settled_at: now, commission_settlement_id: settlementId })
      .in('event_id', eventIds)
      .eq('payment_status', 'paid')
      .is('commission_settled_at', null)
      .gt('platform_fee_amount', 0),
  ]);
}
