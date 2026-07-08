'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { eventSchema, applicationReviewSchema, stallAssignmentSchema, stallLayoutSchema, vendorTermsSchema } from '@/lib/validations';
import { generateToken, slugify } from '@/lib/utils';
import { stallCodeForCell } from '@/lib/stall-layout';
import type { StallLayoutCell } from '@/lib/stall-layout';
import type { ActionResult } from '@/types';
import { sendRsvpConfirmationEmail, sendVendorStatusEmail } from '@/lib/email';
import { getAppUrl } from '@/lib/env';
import { createRazorpayOrder, verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { refundRazorpayPayment } from '@/lib/payments/razorpay-refund';
import { ensureVendorPaymentRecord } from '@/lib/payments/ensure-payment';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatMenuDescription, parseMenuItemsJson } from '@/lib/menu';
import { DEFAULT_VENDOR_TERMS } from '@/lib/vendor-terms';
import {
  exceedsGridLimit,
  getPlanLimits,
  gridLimitMessage,
  publishedEventLimitMessage,
} from '@/lib/plans';
import { getOrganizerPlan } from '@/lib/plans-server';

function mapZodErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

function zodFirstError(error: { flatten: () => { fieldErrors: Record<string, string[]> } }): string {
  const fields = error.flatten().fieldErrors;
  const first = Object.values(fields).flat().find(Boolean);
  return first ?? 'Invalid input';
}

function formString(formData: FormData, key: string, fallback = ''): string {
  const value = formData.get(key);
  return value == null ? fallback : String(value);
}

async function getOrganizerId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return { supabase, userId: user.id };
}

export async function createEventAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const raw = {
    title: formData.get('title')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    venueName: formData.get('venueName')?.toString() ?? '',
    venueAddress: formData.get('venueAddress')?.toString() ?? '',
    city: formData.get('city')?.toString() ?? '',
    eventDate: formData.get('eventDate')?.toString() ?? '',
    setupTime: formData.get('setupTime')?.toString() ?? '',
    startTime: formData.get('startTime')?.toString() ?? '',
    endTime: formData.get('endTime')?.toString() ?? '',
    stallRows: formData.get('stallRows'),
    stallCols: formData.get('stallCols'),
    visitorCapacity: formData.get('visitorCapacity'),
    stallFee: formData.get('stallFee'),
    rsvpEntryFee: formData.get('rsvpEntryFee') ?? '0',
    coverImageUrl: formData.get('coverImageUrl')?.toString() ?? '',
  };

  const stallLayoutRaw = formData.get('stallLayout');
  let stallLayout: StallLayoutCell[] | null = null;
  if (stallLayoutRaw && typeof stallLayoutRaw === 'string') {
    try {
      const parsedLayout = stallLayoutSchema.safeParse(JSON.parse(stallLayoutRaw));
      if (parsedLayout.success) {
        stallLayout = parsedLayout.data;
      }
    } catch {
      // Fall back to auto-generated layout
    }
  }

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = mapZodErrors(parsed.error);
    const firstError = Object.values(fieldErrors).flat()[0];
    return {
      success: false,
      error: firstError ?? 'Please fix the highlighted fields',
      fieldErrors,
    };
  }

  const { supabase, userId } = await getOrganizerId();
  const plan = await getOrganizerPlan(supabase, userId);

  if (exceedsGridLimit(parsed.data.stallRows, parsed.data.stallCols, plan)) {
    return {
      success: false,
      error: gridLimitMessage(plan),
      fieldErrors: {
        stallRows: [gridLimitMessage(plan)],
        stallCols: [gridLimitMessage(plan)],
      },
    };
  }

  const rsvpFee = Number(parsed.data.rsvpEntryFee ?? 0);
  if (rsvpFee > 0 && !getPlanLimits(plan).rsvpEntryFees) {
    return {
      success: false,
      error: 'RSVP entry fees require the Paid RSVP plan.',
      fieldErrors: { rsvpEntryFee: ['Upgrade to Paid RSVP to collect entry fees from guests'] },
    };
  }

  const { data: conflictingEvent } = await supabase
    .from('events')
    .select('id, title')
    .eq('organizer_id', userId)
    .eq('event_date', parsed.data.eventDate)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (conflictingEvent) {
    return {
      success: false,
      error: `You already have "${conflictingEvent.title}" scheduled on this date. Pick another date.`,
      fieldErrors: { eventDate: ['This date is already booked for another event'] },
    };
  }

  const slug = `${slugify(parsed.data.title)}-${generateToken(6)}`;

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      organizer_id: userId,
      title: parsed.data.title,
      slug,
      description: parsed.data.description || null,
      venue_name: parsed.data.venueName,
      venue_address: parsed.data.venueAddress,
      city: parsed.data.city,
      event_date: parsed.data.eventDate,
      setup_time: parsed.data.setupTime || null,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      stall_rows: parsed.data.stallRows,
      stall_cols: parsed.data.stallCols,
      visitor_capacity: parsed.data.visitorCapacity,
      stall_fee: parsed.data.stallFee,
      rsvp_entry_fee: parsed.data.rsvpEntryFee ?? 0,
      cover_image_url: parsed.data.coverImageUrl || null,
      vendor_terms: DEFAULT_VENDOR_TERMS,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (stallLayout) {
    await generateStallsFromLayout(supabase, event.id, stallLayout);
  } else {
    await generateStallsForEvent(supabase, event.id, parsed.data.stallRows, parsed.data.stallCols);
  }

  revalidatePath('/dashboard/events');
  return { success: true, data: { id: event.id } };
}

async function generateStallsForEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  rows: number,
  cols: number,
) {
  const stalls = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const code = `${letters[r] ?? `R${r}`}${c + 1}`;
      let zone: 'food_truck' | 'food_stall' | 'blocked' | 'entrance' | 'stage' = 'food_truck';

      if (r === 0 && c === Math.floor(cols / 2)) zone = 'entrance';
      else if (r === rows - 1 && c === Math.floor(cols / 2)) zone = 'stage';
      else if (c === 0 || c === cols - 1) zone = 'food_stall';
      else if (r === 0 || r === rows - 1) zone = 'food_stall';

      stalls.push({
        event_id: eventId,
        stall_code: code,
        row_index: r,
        col_index: c,
        zone,
        has_power: zone === 'food_truck' || zone === 'food_stall',
        is_available: zone === 'food_truck' || zone === 'food_stall',
      });
    }
  }

  await supabase.from('stalls').insert(stalls);
}

async function generateStallsFromLayout(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  layout: StallLayoutCell[],
) {
  const stalls = layout.map((cell) => ({
    event_id: eventId,
    stall_code: stallCodeForCell(cell.row, cell.col),
    row_index: cell.row,
    col_index: cell.col,
    zone: cell.zone,
    has_power: cell.zone === 'food_truck' || cell.zone === 'food_stall',
    is_available: cell.zone === 'food_truck' || cell.zone === 'food_stall',
    is_premium: Boolean(cell.isPremium && (cell.zone === 'food_truck' || cell.zone === 'food_stall')),
    premium_fee: cell.isPremium ? (cell.premiumFee ?? 0) : 0,
  }));

  await supabase.from('stalls').insert(stalls);
}

export async function publishEventAction(eventId: string): Promise<ActionResult> {
  const { supabase, userId } = await getOrganizerId();
  const plan = await getOrganizerPlan(supabase, userId);
  const limits = getPlanLimits(plan);

  const { data: event } = await supabase
    .from('events')
    .select('status')
    .eq('id', eventId)
    .eq('organizer_id', userId)
    .single();

  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  if (event.status !== 'published' && limits.maxPublishedEvents !== null) {
    const { count } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_id', userId)
      .eq('status', 'published');

    if ((count ?? 0) >= limits.maxPublishedEvents) {
      return { success: false, error: publishedEventLimitMessage(plan) };
    }
  }

  const { error } = await supabase
    .from('events')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .eq('organizer_id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath('/dashboard/events');
  return { success: true };
}

export async function updateEventVendorTermsAction(
  eventId: string,
  vendorTerms: string,
): Promise<ActionResult> {
  const parsed = vendorTermsSchema.safeParse({ vendorTerms });
  if (!parsed.success) {
    return { success: false, error: 'Invalid terms', fieldErrors: mapZodErrors(parsed.error) };
  }

  const { supabase, userId } = await getOrganizerId();

  const { error } = await supabase
    .from('events')
    .update({
      vendor_terms: parsed.data.vendorTerms,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .eq('organizer_id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/events/${eventId}/terms`);
  revalidatePath(`/dashboard/events/${eventId}`);
  return { success: true };
}

export async function deleteEventAction(eventId: string): Promise<
  ActionResult<{ refundsIssued: number; refundErrors: string[] }>
> {
  const { supabase, userId } = await getOrganizerId();

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organizer_id', userId)
    .single();

  if (!event) return { success: false, error: 'Unauthorized' };

  const admin = createAdminClient();
  const refundErrors: string[] = [];
  let refundsIssued = 0;

  const { data: applications } = await admin
    .from('vendor_applications')
    .select('id')
    .eq('event_id', eventId);

  const applicationIds = applications?.map((a) => a.id) ?? [];

  if (applicationIds.length > 0) {
    const { data: vendorPayments } = await admin
      .from('payments')
      .select('id, amount, status, razorpay_payment_id')
      .in('application_id', applicationIds)
      .eq('status', 'paid')
      .not('razorpay_payment_id', 'is', null);

    for (const payment of vendorPayments ?? []) {
      if (!payment.razorpay_payment_id) continue;
      const result = await refundRazorpayPayment(payment.razorpay_payment_id, Number(payment.amount));
      if (result.success) {
        refundsIssued += 1;
        await admin
          .from('payments')
          .update({ notes: 'Refunded via Razorpay before event deletion' })
          .eq('id', payment.id);
      } else {
        refundErrors.push(`Vendor payment ${payment.id.slice(0, 8)}: ${result.error}`);
      }
    }
  }

  const { data: rsvpPayments } = await admin
    .from('visitor_rsvps')
    .select('id, entry_fee_amount, payment_status, razorpay_payment_id')
    .eq('event_id', eventId)
    .eq('payment_status', 'paid')
    .not('razorpay_payment_id', 'is', null);

  for (const rsvp of rsvpPayments ?? []) {
    if (!rsvp.razorpay_payment_id) continue;
    const result = await refundRazorpayPayment(
      rsvp.razorpay_payment_id,
      Number(rsvp.entry_fee_amount ?? 0),
    );
    if (result.success) {
      refundsIssued += 1;
    } else {
      refundErrors.push(`RSVP ${rsvp.id.slice(0, 8)}: ${result.error}`);
    }
  }

  const { error } = await supabase.from('events').delete().eq('id', eventId).eq('organizer_id', userId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/events');
  revalidatePath('/dashboard');
  return { success: true, data: { refundsIssued, refundErrors } };
}

export async function submitVendorApplicationAction(
  eventSlug: string,
  formData: FormData,
): Promise<ActionResult<{ token: string; emailSent: boolean; emailError?: string }>> {
  const { vendorApplicationSchema } = await import('@/lib/validations');

  const raw = {
    businessName: formString(formData, 'businessName'),
    ownerName: formString(formData, 'ownerName'),
    email: formString(formData, 'email'),
    phone: formString(formData, 'phone'),
    cuisineType: formString(formData, 'cuisineType'),
    menuDescription: formString(formData, 'menuDescription'),
    menuItems: formString(formData, 'menuItems', '[]'),
    vendorType: formString(formData, 'vendorType'),
    truckName: formString(formData, 'truckName'),
    truckLengthFt: formString(formData, 'truckLengthFt'),
    preferredStallId: formString(formData, 'preferredStallId'),
    needsPower: formData.get('needsPower') === 'on' || formData.get('needsPower') === 'true',
    needsWater: formData.get('needsWater') === 'on' || formData.get('needsWater') === 'true',
    powerRequirements: formString(formData, 'powerRequirements') || undefined,
    instagramHandle: formString(formData, 'instagramHandle'),
    acceptedTerms:
      formData.get('acceptedTerms') === 'true' || formData.get('acceptedTerms') === 'on',
  };

  const parsed = vendorApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: zodFirstError(parsed.error),
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_date, venue_name, city, stall_fee, status')
    .eq('slug', eventSlug)
    .eq('status', 'published')
    .single();

  if (!event) {
    return { success: false, error: 'Event not found or not accepting applications' };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const { data: existingByEmail } = await supabase
    .from('vendor_applications')
    .select('id')
    .eq('event_id', event.id)
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (existingByEmail) {
    return {
      success: false,
      error: 'This email has already applied to this event.',
      fieldErrors: { email: ['An application with this email already exists for this market'] },
    };
  }

  const { data: existingByBusiness } = await supabase
    .from('vendor_applications')
    .select('id')
    .eq('event_id', event.id)
    .ilike('business_name', parsed.data.businessName.trim())
    .maybeSingle();

  if (existingByBusiness) {
    return {
      success: false,
      error: 'A vendor with this business name has already applied to this event.',
      fieldErrors: { businessName: ['This business name is already registered for this market'] },
    };
  }

  let preferredStall:
    | { id: string; stall_code: string; is_premium: boolean; premium_fee: number }
    | null = null;

  if (parsed.data.preferredStallId) {
    const { data: stall } = await supabase
      .from('stalls')
      .select('id, stall_code, is_premium, premium_fee, is_available, zone')
      .eq('id', parsed.data.preferredStallId)
      .eq('event_id', event.id)
      .single();

    if (!stall || !stall.is_available || (stall.zone !== 'food_truck' && stall.zone !== 'food_stall')) {
      return {
        success: false,
        error: 'Selected stall is no longer available. Please pick another bay.',
        fieldErrors: { preferredStallId: ['This stall is unavailable'] },
      };
    }

    const { count: assignmentCount } = await supabase
      .from('stall_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('stall_id', stall.id);

    if ((assignmentCount ?? 0) > 0) {
      return {
        success: false,
        error: 'Selected stall was just taken. Please pick another bay.',
        fieldErrors: { preferredStallId: ['This stall is already assigned'] },
      };
    }

    preferredStall = stall;
  }

  const token = generateToken(24);
  const menuItems = parseMenuItemsJson(parsed.data.menuItems);
  const menuDescription =
    menuItems.length > 0
      ? formatMenuDescription(menuItems, parsed.data.menuDescription)
      : (parsed.data.menuDescription?.trim() ?? '');

  const { error: insertError } = await supabase.from('vendor_applications').insert({
    event_id: event.id,
    business_name: parsed.data.businessName,
    owner_name: parsed.data.ownerName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    cuisine_type: parsed.data.cuisineType,
    menu_description: menuDescription,
    ...(menuItems.length > 0 ? { menu_items: menuItems } : {}),
    vendor_type: parsed.data.vendorType,
    truck_name: parsed.data.truckName,
    truck_length_ft: parsed.data.truckLengthFt,
    preferred_stall_id: preferredStall?.id ?? null,
    needs_power: parsed.data.needsPower,
    needs_water: parsed.data.needsWater,
    power_requirements: parsed.data.powerRequirements || null,
    instagram_handle: parsed.data.instagramHandle || null,
    status: 'pending',
    access_token: token,
  });

  let error = insertError;
  if (error?.message?.includes('menu_items')) {
    const { error: retryError } = await supabase.from('vendor_applications').insert({
      event_id: event.id,
      business_name: parsed.data.businessName,
      owner_name: parsed.data.ownerName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      cuisine_type: parsed.data.cuisineType,
      menu_description: menuDescription,
      vendor_type: parsed.data.vendorType,
      truck_name: parsed.data.truckName,
      truck_length_ft: parsed.data.truckLengthFt,
      preferred_stall_id: preferredStall?.id ?? null,
      needs_power: parsed.data.needsPower,
      needs_water: parsed.data.needsWater,
      power_requirements: parsed.data.powerRequirements || null,
      instagram_handle: parsed.data.instagramHandle || null,
      status: 'pending',
      access_token: token,
    });
    error = retryError;
  }

  if (error) return { success: false, error: error.message };

  const appUrl = getAppUrl();
  const emailResult = await sendVendorStatusEmail(parsed.data.email, {
    businessName: parsed.data.businessName,
    ownerName: parsed.data.ownerName,
    status: 'pending',
    eventTitle: event.title,
    eventDate: event.event_date,
    venueName: event.venue_name,
    city: event.city,
    stallFee: Number(event.stall_fee),
    premiumFee: preferredStall?.is_premium ? Number(preferredStall.premium_fee) : 0,
    preferredStallCode: preferredStall?.stall_code,
    statusUrl: `${appUrl}/vendor/${token}`,
  });

  return {
    success: true,
    data: {
      token,
      emailSent: emailResult.success && !emailResult.skipped,
      emailError: emailResult.error,
    },
  };
}

export async function reviewApplicationAction(
  applicationId: string,
  formData: FormData,
): Promise<ActionResult<{ emailSent?: boolean; emailError?: string }>> {
  const raw = {
    status: formString(formData, 'status'),
    rejectionReason: formString(formData, 'rejectionReason') || undefined,
  };

  const parsed = applicationReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: zodFirstError(parsed.error),
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  if (parsed.data.status === 'rejected' && !parsed.data.rejectionReason) {
    return { success: false, error: 'Please provide a rejection reason' };
  }

  const { supabase, userId } = await getOrganizerId();

  const { data: application } = await supabase
    .from('vendor_applications')
    .select('*, events!inner(id, title, event_date, venue_name, city, stall_fee, organizer_id)')
    .eq('id', applicationId)
    .single();

  if (!application) {
    return { success: false, error: 'Unauthorized' };
  }

  const eventData = application.events as unknown as {
    id: string;
    title: string;
    event_date: string;
    venue_name: string;
    city: string;
    stall_fee: number;
    organizer_id: string;
  };

  if (eventData.organizer_id !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const preferredStall = application.preferred_stall_id
    ? (
        await supabase
          .from('stalls')
          .select('stall_code, is_premium, premium_fee')
          .eq('id', application.preferred_stall_id)
          .maybeSingle()
      ).data
    : null;

  const premiumFee =
    preferredStall?.is_premium && parsed.data.status === 'approved'
      ? Number(preferredStall.premium_fee ?? 0)
      : 0;
  const totalAmount = Number(eventData.stall_fee) + premiumFee;

  const { error } = await supabase
    .from('vendor_applications')
    .update({
      status: parsed.data.status,
      rejection_reason: parsed.data.rejectionReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (error) return { success: false, error: error.message };

  if (parsed.data.status === 'approved') {
    const { error: paymentError } = await supabase.from('payments').upsert(
      {
        event_id: application.event_id,
        application_id: applicationId,
        amount: totalAmount,
        status: 'pending',
      },
      { onConflict: 'application_id' },
    );

    if (paymentError) {
      console.error('[payments] Upsert failed:', paymentError);
      return {
        success: false,
        error: `Approved but payment record failed: ${paymentError.message}`,
      };
    }
  }

  const appUrl = getAppUrl();
  const emailResult = await sendVendorStatusEmail(application.email, {
    businessName: application.business_name,
    ownerName: application.owner_name,
    status: parsed.data.status,
    eventTitle: eventData.title,
    eventDate: eventData.event_date,
    venueName: eventData.venue_name,
    city: eventData.city,
    stallFee: Number(eventData.stall_fee),
    premiumFee,
    preferredStallCode: preferredStall?.stall_code,
    rejectionReason: parsed.data.rejectionReason,
    statusUrl: `${appUrl}/vendor/${application.access_token}`,
    paymentUrl:
      parsed.data.status === 'approved'
        ? `${appUrl}/vendor/${application.access_token}#pay`
        : undefined,
  });

  revalidatePath(`/dashboard/events/${application.event_id}/applications`);
  revalidatePath(`/vendor/${application.access_token}`);

  return {
    success: true,
    data: {
      emailSent: emailResult.success && !emailResult.skipped,
      emailError: emailResult.error,
    },
  };
}

export async function assignStallAction(
  eventId: string,
  stallId: string,
  applicationId: string | null,
): Promise<ActionResult> {
  const { supabase, userId } = await getOrganizerId();

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .eq('organizer_id', userId)
    .single();

  if (!event) return { success: false, error: 'Unauthorized' };

  const { data: existingAssignment } = await supabase
    .from('stall_assignments')
    .select('application_id, vendor_applications(id, business_name)')
    .eq('stall_id', stallId)
    .maybeSingle();

  if (existingAssignment?.application_id) {
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('status')
      .eq('application_id', existingAssignment.application_id)
      .maybeSingle();

    if (existingPayment?.status === 'paid') {
      return {
        success: false,
        error: applicationId
          ? 'This bay is locked — the assigned vendor has already paid.'
          : 'Cannot remove assignment — vendor has already paid for this bay.',
      };
    }
  }

  await supabase.from('stall_assignments').delete().eq('stall_id', stallId);

  if (applicationId) {
    const parsed = stallAssignmentSchema.safeParse({ stallId, applicationId });
    if (!parsed.success) {
      return { success: false, error: 'Invalid assignment' };
    }

    const { data: vendorOnOtherBay } = await supabase
      .from('stall_assignments')
      .select('stall_id, stalls(stall_code)')
      .eq('application_id', applicationId)
      .neq('stall_id', stallId)
      .maybeSingle();

    if (vendorOnOtherBay) {
      const stallCode = (vendorOnOtherBay.stalls as { stall_code?: string } | null)?.stall_code;
      return {
        success: false,
        error: stallCode
          ? `This vendor is already assigned to bay ${stallCode}.`
          : 'This vendor is already assigned to another bay.',
      };
    }

    const { error } = await supabase.from('stall_assignments').insert({
      stall_id: stallId,
      application_id: applicationId,
    });

    if (error) return { success: false, error: error.message };

    const { data: assignmentDetails } = await supabase
      .from('vendor_applications')
      .select('email, owner_name, business_name, access_token, events(title, event_date, venue_name, city)')
      .eq('id', applicationId)
      .single();

    const { data: stall } = await supabase
      .from('stalls')
      .select('stall_code')
      .eq('id', stallId)
      .single();

    if (assignmentDetails && stall) {
      const evt = assignmentDetails.events as unknown as {
        title: string;
        event_date: string;
        venue_name: string;
        city: string;
      };
      const appUrl = getAppUrl();
      await sendVendorStatusEmail(assignmentDetails.email, {
        businessName: assignmentDetails.business_name,
        ownerName: assignmentDetails.owner_name,
        status: 'approved',
        eventTitle: evt.title,
        eventDate: evt.event_date,
        venueName: evt.venue_name,
        city: evt.city,
        assignedStallCode: stall.stall_code,
        statusUrl: `${appUrl}/vendor/${assignmentDetails.access_token}`,
        paymentUrl: `${appUrl}/vendor/${assignmentDetails.access_token}#pay`,
      });
    }
  }

  revalidatePath(`/dashboard/events/${eventId}/stalls`);
  return { success: true };
}

export async function ensureEventStallsAction(eventId: string): Promise<ActionResult<{ count: number }>> {
  const { supabase, userId } = await getOrganizerId();

  const { data: event } = await supabase
    .from('events')
    .select('id, slug, stall_rows, stall_cols')
    .eq('id', eventId)
    .eq('organizer_id', userId)
    .single();

  if (!event) return { success: false, error: 'Unauthorized' };

  const rows = Number(event.stall_rows);
  const cols = Number(event.stall_cols);
  if (!rows || !cols) {
    return { success: false, error: 'Set stall grid size on the event before generating bays.' };
  }

  const { count } = await supabase
    .from('stalls')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if ((count ?? 0) > 0) {
    return { success: false, error: 'Floor plan already exists for this event.' };
  }

  await generateStallsForEvent(supabase, eventId, rows, cols);

  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/stalls`);
  if (event.slug) {
    revalidatePath(`/e/${event.slug}`);
    revalidatePath(`/apply/${event.slug}`);
  }

  return { success: true, data: { count: rows * cols } };
}

export async function submitRsvpAction(
  eventSlug: string,
  formData: FormData,
): Promise<ActionResult<{ token: string; status: string; emailSent: boolean; paymentPending?: boolean; entryFeeAmount?: number }>> {
  const { rsvpSchema } = await import('@/lib/validations');

  const raw = {
    name: formString(formData, 'name'),
    email: formString(formData, 'email'),
    phone: formString(formData, 'phone') || undefined,
    partySize: formString(formData, 'partySize'),
  };

  const parsed = rsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: zodFirstError(parsed.error),
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_date, venue_name, venue_address, city, start_time, end_time, setup_time, description, visitor_capacity, status, rsvp_entry_fee')
    .eq('slug', eventSlug)
    .eq('status', 'published')
    .single();

  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const { data: existingRsvp } = await supabase
    .from('visitor_rsvps')
    .select('id, status')
    .eq('event_id', event.id)
    .ilike('email', normalizedEmail)
    .maybeSingle();

  if (existingRsvp) {
    return {
      success: false,
      error: 'This email already has an RSVP for this event.',
      fieldErrors: { email: ['You have already reserved a spot with this email'] },
    };
  }

  const { count } = await supabase
    .from('visitor_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'confirmed');

  const currentCount = count ?? 0;
  const spotsNeeded = parsed.data.partySize;
  const isWaitlisted = currentCount + spotsNeeded > event.visitor_capacity;

  const token = generateToken(24);
  const entryFee = Number(event.rsvp_entry_fee ?? 0);
  const needsPayment = entryFee > 0 && !isWaitlisted;

  const { error } = await supabase.from('visitor_rsvps').insert({
    event_id: event.id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    party_size: parsed.data.partySize,
    status: isWaitlisted ? 'waitlisted' : 'confirmed',
    access_token: token,
    entry_fee_amount: needsPayment ? entryFee * parsed.data.partySize : 0,
    payment_status: needsPayment ? 'pending' : 'none',
  });

  if (error) return { success: false, error: error.message };

  const status = isWaitlisted ? 'waitlisted' : 'confirmed';
  const appUrl = getAppUrl();

  const emailResult = await sendRsvpConfirmationEmail(parsed.data.email, {
    guestName: parsed.data.name,
    partySize: parsed.data.partySize,
    status,
    eventTitle: event.title,
    eventDate: event.event_date,
    venueName: event.venue_name,
    venueAddress: event.venue_address,
    city: event.city,
    startTime: event.start_time,
    endTime: event.end_time,
    setupTime: event.setup_time ?? undefined,
    description: event.description ?? undefined,
    confirmationUrl: `${appUrl}/rsvp/${token}`,
  });

  return {
    success: true,
    data: {
      token,
      status,
      emailSent: emailResult.success && !emailResult.skipped,
      paymentPending: needsPayment,
      entryFeeAmount: needsPayment ? entryFee * parsed.data.partySize : 0,
    },
  };
}

export async function updatePaymentStatusAction(
  paymentId: string,
  status: 'pending' | 'paid' | 'waived' | 'overdue',
): Promise<ActionResult> {
  const { supabase, userId } = await getOrganizerId();

  const { data: payment } = await supabase
    .from('payments')
    .select('event_id, events!inner(organizer_id)')
    .eq('id', paymentId)
    .single();

  if (!payment) {
    return { success: false, error: 'Unauthorized' };
  }

  const paymentEvent = payment.events as unknown as { organizer_id: string };
  if (paymentEvent.organizer_id !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('payments')
    .update({
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', paymentId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/events/${payment.event_id}`);
  return { success: true };
}

export async function createVendorPaymentOrderAction(
  accessToken: string,
): Promise<ActionResult<{ orderId: string; amount: number; keyId: string }>> {
  const admin = createAdminClient();

  const { data: application } = await admin
    .from('vendor_applications')
    .select('id, business_name, email, status, access_token')
    .eq('access_token', accessToken)
    .single();

  if (!application || application.status !== 'approved') {
    return { success: false, error: 'Payment not available for this application' };
  }

  const payment = await ensureVendorPaymentRecord(application.id);

  if (!payment) {
    return {
      success: false,
      error: 'No payment record found. Ask the organizer to re-approve your application.',
    };
  }

  if (payment.status === 'paid') return { success: false, error: 'Already paid' };

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
    return { success: false, error: 'Online payments are not configured yet. Contact the organizer.' };
  }

  if (payment.razorpay_order_id) {
    return {
      success: true,
      data: { orderId: payment.razorpay_order_id, amount: Number(payment.amount), keyId },
    };
  }

  const order = await createRazorpayOrder(
    Number(payment.amount),
    `pm_${application.id.slice(0, 8)}`,
    { application_id: application.id },
  );

  await admin
    .from('payments')
    .update({ razorpay_order_id: order.id })
    .eq('id', payment.id);

  return {
    success: true,
    data: { orderId: order.id, amount: Number(payment.amount), keyId },
  };
}

export async function verifyVendorPaymentAction(
  accessToken: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<ActionResult> {
  if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return { success: false, error: 'Payment verification failed' };
  }

  const admin = createAdminClient();

  const { data: application } = await admin
    .from('vendor_applications')
    .select('id')
    .eq('access_token', accessToken)
    .single();

  if (!application) return { success: false, error: 'Application not found' };

  const { error } = await admin
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
    })
    .eq('application_id', application.id);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export async function createRsvpPaymentOrderAction(
  accessToken: string,
): Promise<ActionResult<{ orderId: string; amount: number; keyId: string }>> {
  const admin = createAdminClient();

  const { data: rsvp } = await admin
    .from('visitor_rsvps')
    .select('id, name, email, entry_fee_amount, payment_status, razorpay_order_id, status')
    .eq('access_token', accessToken)
    .single();

  if (!rsvp || rsvp.status === 'waitlisted') {
    return { success: false, error: 'Payment not available for this RSVP' };
  }

  if (rsvp.payment_status === 'paid') return { success: false, error: 'Already paid' };
  if (rsvp.payment_status !== 'pending' || Number(rsvp.entry_fee_amount) <= 0) {
    return { success: false, error: 'No entry fee due for this RSVP' };
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
    return { success: false, error: 'Online payments are not configured yet.' };
  }

  const amount = Number(rsvp.entry_fee_amount);

  if (rsvp.razorpay_order_id) {
    return {
      success: true,
      data: { orderId: rsvp.razorpay_order_id, amount, keyId },
    };
  }

  const order = await createRazorpayOrder(amount, `rsvp_${rsvp.id.slice(0, 8)}`, {
    rsvp_id: rsvp.id,
  });

  await admin
    .from('visitor_rsvps')
    .update({ razorpay_order_id: order.id })
    .eq('id', rsvp.id);

  return {
    success: true,
    data: { orderId: order.id, amount, keyId },
  };
}

export async function verifyRsvpPaymentAction(
  accessToken: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): Promise<ActionResult> {
  if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return { success: false, error: 'Payment verification failed' };
  }

  const admin = createAdminClient();

  const { data: rsvp } = await admin
    .from('visitor_rsvps')
    .select('id')
    .eq('access_token', accessToken)
    .single();

  if (!rsvp) return { success: false, error: 'RSVP not found' };

  const { error } = await admin
    .from('visitor_rsvps')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
    })
    .eq('id', rsvp.id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/rsvp/${accessToken}`);
  return { success: true };
}
