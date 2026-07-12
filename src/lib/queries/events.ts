import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/env';
import { extractMenuItemsFromDescription } from '@/lib/menu';
import type { Event, EventWithStats, StallWithAssignment, VendorApplication, VendorApplicationWithDetails, EventPaymentRow, PaymentStatus } from '@/types';

export async function getEventsForOrganizer(): Promise<EventWithStats[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', user.id)
    .order('event_date', { ascending: true });

  if (!events) return [];

  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const [apps, rsvps, stallIdsResult] = await Promise.all([
        supabase
          .from('vendor_applications')
          .select('id, status', { count: 'exact' })
          .eq('event_id', event.id),
        supabase
          .from('visitor_rsvps')
          .select('id', { count: 'exact' })
          .eq('event_id', event.id)
          .eq('status', 'confirmed'),
        supabase.from('stalls').select('id').eq('event_id', event.id),
      ]);

      const stallIds = stallIdsResult.data?.map((s) => s.id) ?? [];

      const assignments =
        stallIds.length > 0
          ? await supabase
              .from('stall_assignments')
              .select('id', { count: 'exact', head: true })
              .in('stall_id', stallIds)
          : { count: 0 };

      const approved = apps.data?.filter((a) => a.status === 'approved').length ?? 0;

      return {
        ...event,
        application_count: apps.count ?? 0,
        approved_count: approved,
        rsvp_count: rsvps.count ?? 0,
        assigned_stalls: assignments.count ?? 0,
      } as EventWithStats;
    }),
  );

  return eventsWithStats;
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('*').eq('id', eventId).single();
  return data;
}

export async function getEventBySlug(slug: string): Promise<(Event & { isPreview?: boolean }) | null> {
  const supabase = await createClient();

  const { data: published } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (published) return published;

  // Draft / unpublished: owning organizer can preview public & apply links
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Prefer owner RLS; fall back to service role so previews work even if
  // session cookies are slow to refresh when opening links in a new tab.
  const { data: ownedViaRls } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('organizer_id', user.id)
    .maybeSingle();

  if (ownedViaRls) {
    return { ...ownedViaRls, isPreview: ownedViaRls.status !== 'published' };
  }

  try {
    const admin = createAdminClient();
    const { data: owned } = await admin
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('organizer_id', user.id)
      .maybeSingle();

    if (!owned) return null;
    return { ...owned, isPreview: owned.status !== 'published' };
  } catch {
    return null;
  }
}

export async function getApplicationsForEvent(eventId: string): Promise<VendorApplication[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vendor_applications')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getApplicationsWithDetailsForEvent(
  eventId: string,
): Promise<VendorApplicationWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vendor_applications')
    .select(
      `
      *,
      payments(amount, status, paid_at),
      stall_assignments(stalls(stall_code))
    `,
    )
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  const apps = data ?? [];
  const preferredIds = apps.map((a) => a.preferred_stall_id).filter(Boolean) as string[];
  const preferredMap = new Map<string, string>();

  if (preferredIds.length > 0) {
    const { data: prefStalls } = await supabase
      .from('stalls')
      .select('id, stall_code')
      .in('id', preferredIds);
    for (const s of prefStalls ?? []) {
      preferredMap.set(s.id, s.stall_code);
    }
  }

  return apps.map((row) => {
    const rawPayment = row.payments as
      | { amount: number; status: string; paid_at: string | null }
      | { amount: number; status: string; paid_at: string | null }[]
      | null;
    const paymentRow = Array.isArray(rawPayment) ? rawPayment[0] : rawPayment;
    const payments = paymentRow
      ? {
          amount: paymentRow.amount,
          status: paymentRow.status as PaymentStatus,
          paid_at: paymentRow.paid_at,
        }
      : null;
    const assignment = row.stall_assignments as
      | { stalls: { stall_code: string } | { stall_code: string }[] }
      | { stalls: { stall_code: string } | { stall_code: string }[] }[]
      | null;
    const stallData = Array.isArray(assignment) ? assignment[0]?.stalls : assignment?.stalls;
    const stall = Array.isArray(stallData) ? stallData[0] : stallData;

    return {
      ...(row as VendorApplication),
      payment: payments,
      assigned_stall_code: stall?.stall_code ?? null,
      preferred_stall_code: row.preferred_stall_id
        ? (preferredMap.get(row.preferred_stall_id) ?? null)
        : null,
    };
  });
}

export async function getPaymentsForEvent(eventId: string): Promise<EventPaymentRow[]> {
  const supabase = await createClient();

  const [{ data: vendorPayments }, { data: rsvps }] = await Promise.all([
    supabase
      .from('payments')
      .select(
        'id, amount, platform_fee_amount, organizer_net_amount, status, paid_at, created_at, razorpay_payment_id, razorpay_order_id, vendor_applications(business_name, email)',
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: false }),
    supabase
      .from('visitor_rsvps')
      .select(
        'id, name, email, entry_fee_amount, platform_fee_amount, organizer_net_amount, payment_status, paid_at, created_at, razorpay_payment_id, razorpay_order_id',
      )
      .eq('event_id', eventId)
      .neq('payment_status', 'none')
      .order('created_at', { ascending: false }),
  ]);

  const vendorRows: EventPaymentRow[] = (vendorPayments ?? []).map((p) => {
    const rawApp = p.vendor_applications as
      | { business_name: string; email: string }
      | { business_name: string; email: string }[]
      | null;
    const app = Array.isArray(rawApp) ? rawApp[0] : rawApp;
    const amount = Number(p.amount);
    const platformFee = Number(p.platform_fee_amount ?? 0);
    const organizerNet = Number(p.organizer_net_amount ?? amount - platformFee);
    return {
      id: p.id,
      type: 'vendor' as const,
      name: app?.business_name ?? 'Vendor',
      email: app?.email ?? '',
      amount,
      platform_fee_amount: platformFee,
      organizer_net_amount: organizerNet,
      status: p.status,
      paid_at: p.paid_at,
      reference: p.razorpay_payment_id?.slice(-10) ?? p.id.slice(0, 8),
      razorpay_payment_id: p.razorpay_payment_id ?? null,
      razorpay_order_id: p.razorpay_order_id ?? null,
      created_at: p.created_at,
    };
  });

  const rsvpRows: EventPaymentRow[] = (rsvps ?? []).map((r) => {
    const amount = Number(r.entry_fee_amount);
    const platformFee = Number(r.platform_fee_amount ?? 0);
    const organizerNet = Number(r.organizer_net_amount ?? amount - platformFee);
    return {
      id: r.id,
      type: 'rsvp' as const,
      name: r.name,
      email: r.email,
      amount,
      platform_fee_amount: platformFee,
      organizer_net_amount: organizerNet,
      status: r.payment_status,
      paid_at: r.paid_at,
      reference: r.razorpay_payment_id?.slice(-10) ?? r.id.slice(0, 8),
      razorpay_payment_id: r.razorpay_payment_id ?? null,
      razorpay_order_id: r.razorpay_order_id ?? null,
      created_at: r.created_at,
    };
  });

  return [...vendorRows, ...rsvpRows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getStallsWithAssignments(eventId: string): Promise<StallWithAssignment[]> {
  const supabase = await createClient();

  const { data: stalls } = await supabase
    .from('stalls')
    .select('*')
    .eq('event_id', eventId)
    .order('row_index')
    .order('col_index');

  if (!stalls) return [];

  const { data: assignments } = await supabase
    .from('stall_assignments')
    .select('*, vendor_applications(id, business_name, cuisine_type, status)')
    .in(
      'stall_id',
      stalls.map((s) => s.id),
    );

  const applicationIds =
    assignments?.map((a) => a.application_id).filter(Boolean) ?? [];

  const paymentByApp = new Map<string, string>();
  if (applicationIds.length > 0) {
    const admin = createAdminClient();
    const { data: payments } = await admin
      .from('payments')
      .select('application_id, status')
      .in('application_id', applicationIds);

    for (const p of payments ?? []) {
      paymentByApp.set(p.application_id, p.status);
    }
  }

  return stalls.map((stall) => {
    const assignment = assignments?.find((a) => a.stall_id === stall.id);
    const vendorData = assignment?.vendor_applications as
      | { id: string; business_name: string; cuisine_type: string; status: string }
      | undefined;

    return {
      ...stall,
      assignment: assignment
        ? {
            id: assignment.id,
            stall_id: assignment.stall_id,
            application_id: assignment.application_id,
            assigned_at: assignment.assigned_at,
            application: vendorData
              ? {
                  id: vendorData.id,
                  business_name: vendorData.business_name,
                  cuisine_type: vendorData.cuisine_type,
                  status: vendorData.status,
                  payment_status: (paymentByApp.get(vendorData.id) as
                    | 'pending'
                    | 'paid'
                    | 'waived'
                    | 'overdue'
                    | undefined) ?? null,
                }
              : undefined,
          }
        : undefined,
    };
  });
}

export async function getApplicationByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vendor_applications')
    .select('*, events(title, event_date, venue_name, city, stall_fee)')
    .eq('access_token', token)
    .single();
  return data;
}

export async function getRsvpByToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('visitor_rsvps')
    .select(
      '*, events(id, title, event_date, venue_name, venue_address, city, start_time, end_time, setup_time, description)',
    )
    .eq('access_token', token)
    .single();
  return data;
}

export async function getPaymentByApplicationId(applicationId: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('[payments] Fetch failed:', error.message);
      return null;
    }

    return data;
  } catch {
    const supabase = await createClient();
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();
    return data;
  }
}

export async function getAssignedStallForApplication(applicationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stall_assignments')
    .select('stalls(stall_code, is_premium, premium_fee)')
    .eq('application_id', applicationId)
    .maybeSingle();
  const stallData = data?.stalls;
  const stall = Array.isArray(stallData) ? stallData[0] : stallData;
  return (stall as { stall_code: string; is_premium: boolean; premium_fee: number } | null) ?? null;
}

export async function getApprovedVendorsForEvent(eventId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vendor_applications')
    .select('id, business_name, cuisine_type, menu_description, truck_name')
    .eq('event_id', eventId)
    .eq('status', 'approved');
  return data ?? [];
}

/** Approved vendors with paid or waived stall fees */
export async function getPaidVendorCountForEvent(eventId: string): Promise<number> {
  const admin = createAdminClient();
  const { data: apps } = await admin
    .from('vendor_applications')
    .select('id')
    .eq('event_id', eventId)
    .eq('status', 'approved');

  const ids = apps?.map((a) => a.id) ?? [];
  if (ids.length === 0) return 0;

  const { count } = await admin
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .in('application_id', ids)
    .in('status', ['paid', 'waived']);

  return count ?? 0;
}

/** Approved vendors with cuisine + menu filled — required before public page goes live */
export async function getPublicReadyVendorsForEvent(eventId: string) {
  const vendors = await getApprovedVendorsForEvent(eventId);
  return vendors.filter((v) => {
    if (!v.cuisine_type?.trim() || !v.business_name?.trim()) return false;
    const items = extractMenuItemsFromDescription(v.menu_description);
    return Boolean(v.menu_description?.trim()) || items.length > 0;
  });
}

export async function countPublicReadyVendors(eventId: string): Promise<number> {
  const vendors = await getPublicReadyVendorsForEvent(eventId);
  return vendors.length;
}

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: events } = await supabase
    .from('events')
    .select('id, status')
    .eq('organizer_id', user.id);

  const eventIds = events?.map((e) => e.id) ?? [];

  if (eventIds.length === 0) {
    return {
      totalEvents: 0,
      publishedEvents: 0,
      pendingApplications: 0,
      totalRsvps: 0,
    };
  }

  const [pendingApps, rsvps] = await Promise.all([
    supabase
      .from('vendor_applications')
      .select('id', { count: 'exact' })
      .in('event_id', eventIds)
      .eq('status', 'pending'),
    supabase
      .from('visitor_rsvps')
      .select('id', { count: 'exact' })
      .in('event_id', eventIds)
      .eq('status', 'confirmed'),
  ]);

  return {
    totalEvents: events?.length ?? 0,
    publishedEvents: events?.filter((e) => e.status === 'published').length ?? 0,
    pendingApplications: pendingApps.count ?? 0,
    totalRsvps: rsvps.count ?? 0,
  };
}

export interface BookedEventDate {
  date: string;
  title: string;
  venueName: string;
  city: string;
  status: string;
}

export async function getOrganizerBookedDates(): Promise<BookedEventDate[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('events')
    .select('event_date, title, venue_name, city, status')
    .eq('organizer_id', user.id)
    .neq('status', 'cancelled')
    .gte('event_date', today)
    .order('event_date', { ascending: true });

  return (
    data?.map((event) => ({
      date: event.event_date,
      title: event.title,
      venueName: event.venue_name,
      city: event.city,
      status: event.status,
    })) ?? []
  );
}
