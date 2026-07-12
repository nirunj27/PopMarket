import { createClient } from '@/lib/supabase/server';
import { isSuperadminEmail } from '@/lib/env';
import { INDIAN_CITIES } from '@/lib/constants';

export interface PlatformSettings {
  id: number;
  platform_fee_percent: number;
  available_cities: string[];
  platform_enabled: boolean;
  razorpay_key_id: string | null;
  updated_at: string;
}

export async function requireSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false as const, error: 'Unauthorized', supabase, user: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin =
    profile?.role === 'superadmin' || isSuperadminEmail(user.email);

  if (!isAdmin) {
    return { ok: false as const, error: 'Forbidden', supabase, user };
  }

  // Keep profile role in sync with SUPERADMIN_EMAILS env
  if (profile && profile.role !== 'superadmin' && isSuperadminEmail(user.email)) {
    await supabase.from('profiles').update({ role: 'superadmin' }).eq('id', user.id);
  }

  return { ok: true as const, supabase, user, profile };
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle();

  if (!data) {
    return {
      id: 1,
      platform_fee_percent: 10,
      available_cities: [...INDIAN_CITIES],
      platform_enabled: true,
      razorpay_key_id: null,
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: data.id,
    platform_fee_percent: Number(data.platform_fee_percent),
    available_cities: Array.isArray(data.available_cities)
      ? data.available_cities
      : [...INDIAN_CITIES],
    platform_enabled: Boolean(data.platform_enabled),
    razorpay_key_id: data.razorpay_key_id,
    updated_at: data.updated_at,
  };
}

/** Shared copy when superadmin turns platform off */
export const PLATFORM_PAUSED_MESSAGE =
  'PopMarket is temporarily not accepting new markets. You can still manage existing events — try again once the platform is re-enabled.';

export async function isPlatformEnabled(): Promise<boolean> {
  const settings = await getPlatformSettings();
  return settings.platform_enabled;
}

/** Public fee % for signup / terms (works without a logged-in user). */
export async function getPublicPlatformFeePercent(): Promise<number> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    const { data } = await admin
      .from('platform_settings')
      .select('platform_fee_percent')
      .eq('id', 1)
      .maybeSingle();
    return Number(data?.platform_fee_percent ?? 10);
  } catch {
    return 10;
  }
}

export async function getAdminOverview() {
  const gate = await requireSuperadmin();
  if (!gate.ok) return null;

  // Service role: profiles / payments / events are otherwise limited by RLS
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const { calcPlatformSplit } = await import('@/lib/platform/fees');
  const admin = createAdminClient();

  const [eventsRes, organizersRes, paymentsRes, rsvpsRes, settings] = await Promise.all([
    admin
      .from('events')
      .select('id, title, city, event_date, status, organizer_id, stall_fee, rsvp_entry_fee')
      .order('event_date', { ascending: true }),
    admin
      .from('profiles')
      .select('id, full_name, company_name, role, created_at')
      .eq('role', 'organizer'),
    admin
      .from('payments')
      .select('id, event_id, amount, status, platform_fee_amount, organizer_net_amount, paid_at'),
    admin
      .from('visitor_rsvps')
      .select(
        'id, event_id, entry_fee_amount, payment_status, platform_fee_amount, organizer_net_amount',
      ),
    getPlatformSettings(),
  ]);

  const feePercent = settings.platform_fee_percent;
  const events = eventsRes.data ?? [];
  const organizers = organizersRes.data ?? [];

  // Superadmin only sees live markets — never drafts
  const visibleEvents = events.filter(
    (e) => e.status === 'published' || e.status === 'completed',
  );
  const revenueEventIds = new Set(visibleEvents.map((e) => e.id));

  const paidPayments = (paymentsRes.data ?? []).filter(
    (p) => p.status === 'paid' && revenueEventIds.has(p.event_id),
  );
  const paidRsvps = (rsvpsRes.data ?? []).filter(
    (r) => r.payment_status === 'paid' && revenueEventIds.has(r.event_id),
  );

  function splitFromRow(gross: number, storedFee: number, storedNet: number) {
    const amount = Number(gross) || 0;
    const fee = Number(storedFee) || 0;
    const net = Number(storedNet) || 0;

    // Prefer amounts written at payment time when the fee split was stored
    if (fee > 0) {
      return {
        platformFee: fee,
        organizerNet: net > 0 ? net : Math.max(0, amount - fee),
      };
    }

    // Legacy rows with no fee columns — apply current platform %
    if (amount > 0) {
      return calcPlatformSplit(amount, feePercent);
    }

    return { platformFee: 0, organizerNet: 0 };
  }

  let platformRevenue = 0;
  let organizerPayouts = 0;
  let grossCollected = 0;

  for (const p of paidPayments) {
    const gross = Number(p.amount) || 0;
    const { platformFee, organizerNet } = splitFromRow(
      gross,
      Number(p.platform_fee_amount),
      Number(p.organizer_net_amount),
    );
    platformRevenue += platformFee;
    organizerPayouts += organizerNet;
    grossCollected += gross;
  }

  for (const r of paidRsvps) {
    const gross = Number(r.entry_fee_amount) || 0;
    const { platformFee, organizerNet } = splitFromRow(
      gross,
      Number(r.platform_fee_amount),
      Number(r.organizer_net_amount),
    );
    platformRevenue += platformFee;
    organizerPayouts += organizerNet;
    grossCollected += gross;
  }

  const paidVendorGross = paidPayments.filter((p) => Number(p.amount ?? 0) > 0).length;
  const paidRsvpTickets = paidRsvps.filter((r) => Number(r.entry_fee_amount ?? 0) > 0).length;

  const upcoming = visibleEvents.filter(
    (e) => e.status === 'published' && new Date(e.event_date) >= new Date(),
  );

  return {
    totalEvents: visibleEvents.length,
    publishedEvents: visibleEvents.filter((e) => e.status === 'published').length,
    upcomingEvents: upcoming,
    /** Published + completed only (drafts excluded for superadmin) */
    allEvents: visibleEvents,
    organizers,
    /** Sum of platform_fee on paid vendor stalls + paid RSVP tickets (live events only) */
    platformRevenue,
    /** Sum of organizer_net on those same paid transactions */
    organizerPayouts,
    grossCollected,
    paidVendorPayments: paidVendorGross,
    paidRsvps: paidRsvpTickets,
    confirmedRsvps: paidRsvps.length,
    feePercent,
  };
}
