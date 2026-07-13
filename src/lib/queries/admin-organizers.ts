import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperadmin } from '@/lib/platform/admin';
import {
  getOrganizerCommissionSummary,
  type CommissionLineItem,
} from '@/lib/queries/commission';

export type OrganizerBillingStatus = 'due' | 'settled' | 'none';

export interface AdminOrganizerRow {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  gstin: string | null;
  website: string | null;
  about: string | null;
  created_at: string;
  eventCount: number;
  outstandingCommission: number;
  billingStatus: OrganizerBillingStatus;
  lastSettlementAt: string | null;
}

export interface AdminOrganizerDetail extends AdminOrganizerRow {
  settlements: {
    id: string;
    amount: number;
    status: string;
    paid_at: string | null;
    razorpay_payment_id: string | null;
    created_at: string;
  }[];
  outstandingLines: CommissionLineItem[];
  feePercent: number;
}

function billingFromSummary(
  outstandingTotal: number,
  settlements: { status: string; paid_at: string | null }[],
): { billingStatus: OrganizerBillingStatus; lastSettlementAt: string | null } {
  const lastSettlement = settlements.find((s) => s.status === 'paid');
  if (outstandingTotal > 0) {
    return { billingStatus: 'due', lastSettlementAt: lastSettlement?.paid_at ?? null };
  }
  if (lastSettlement) {
    return { billingStatus: 'settled', lastSettlementAt: lastSettlement.paid_at };
  }
  return { billingStatus: 'none', lastSettlementAt: null };
}

export async function getOrganizersForAdmin(): Promise<AdminOrganizerRow[]> {
  const gate = await requireSuperadmin();
  if (!gate.ok) return [];

  const admin = createAdminClient();

  const [{ data: profiles }, { data: authData }, { data: events }] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'id, full_name, company_name, phone, whatsapp, address, city, pincode, gstin, website, about, role, created_at',
      )
      .eq('role', 'organizer')
      .order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('events').select('id, organizer_id, status'),
  ]);

  const emailById = new Map(
    (authData.users ?? []).map((u) => [u.id, u.email ?? ''] as const),
  );

  const eventCountByOrg = new Map<string, number>();
  for (const e of events ?? []) {
    if (e.status === 'draft') continue;
    eventCountByOrg.set(e.organizer_id, (eventCountByOrg.get(e.organizer_id) ?? 0) + 1);
  }

  const summaries = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const summary = await getOrganizerCommissionSummary(p.id);
      const { billingStatus, lastSettlementAt } = billingFromSummary(
        summary.outstandingTotal,
        summary.settlements,
      );
      return {
        id: p.id,
        full_name: p.full_name || 'Unnamed',
        company_name: p.company_name,
        email: emailById.get(p.id) || '—',
        phone: p.phone,
        whatsapp: p.whatsapp,
        address: p.address,
        city: p.city,
        pincode: p.pincode,
        gstin: p.gstin,
        website: p.website,
        about: p.about,
        created_at: p.created_at,
        eventCount: eventCountByOrg.get(p.id) ?? 0,
        outstandingCommission: summary.outstandingTotal,
        billingStatus,
        lastSettlementAt,
      } satisfies AdminOrganizerRow;
    }),
  );

  return summaries;
}

export async function getOrganizerDetailForAdmin(
  organizerId: string,
): Promise<AdminOrganizerDetail | null> {
  const gate = await requireSuperadmin();
  if (!gate.ok) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select(
      'id, full_name, company_name, phone, whatsapp, address, city, pincode, gstin, website, about, role, created_at',
    )
    .eq('id', organizerId)
    .eq('role', 'organizer')
    .maybeSingle();

  if (!profile) return null;

  const [{ data: userData }, { count: eventCount }, summary] = await Promise.all([
    admin.auth.admin.getUserById(organizerId),
    admin
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_id', organizerId)
      .neq('status', 'draft'),
    getOrganizerCommissionSummary(organizerId),
  ]);

  const { billingStatus, lastSettlementAt } = billingFromSummary(
    summary.outstandingTotal,
    summary.settlements,
  );

  return {
    id: profile.id,
    full_name: profile.full_name || 'Unnamed',
    company_name: profile.company_name,
    email: userData.user?.email ?? '—',
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    address: profile.address,
    city: profile.city,
    pincode: profile.pincode,
    gstin: profile.gstin,
    website: profile.website,
    about: profile.about,
    created_at: profile.created_at,
    eventCount: eventCount ?? 0,
    outstandingCommission: summary.outstandingTotal,
    billingStatus,
    lastSettlementAt,
    settlements: summary.settlements,
    outstandingLines: summary.outstandingLines,
    feePercent: summary.feePercent,
  };
}
