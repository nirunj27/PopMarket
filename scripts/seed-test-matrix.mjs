/**
 * Supplemental fixtures for every major workflow (billing, admin, free RSVP, menu pics).
 * Run after seed:demo — or use npm run seed:full
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const DEMO_ORGANIZER = 'organizer@popmarket.dev';
const CLIENT2_EMAIL = 'client2@popmarket.dev';

/** 1×1 orange pixel — keeps menu_items JSON small */
const TINY_DISH_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPM/BwADBwFDRpJSYQAAAABJRU5ErkJggg==';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

async function getUserId(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email === email);
  return user?.id ?? null;
}

async function seedTestMatrix() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const organizerId = await getUserId(supabase, DEMO_ORGANIZER);
  if (!organizerId) {
    console.error('Run npm run seed:dev first');
    process.exit(1);
  }

  console.log('\nSeeding test matrix (all workflows)...\n');

  // Platform settings + organizer terms acceptance (billing / signup flow)
  await supabase.from('platform_settings').upsert({
    id: 1,
    platform_fee_percent: 10,
    platform_enabled: true,
  });

  await supabase
    .from('profiles')
    .update({
      accepted_terms_at: new Date().toISOString(),
      accepted_terms_version: '2026-01',
    })
    .eq('id', organizerId);

  console.log('  Platform settings + organizer terms acceptance');

  const { data: mainEvent } = await supabase
    .from('events')
    .select('id, stall_fee')
    .eq('slug', 'corporate-lunch-market')
    .maybeSingle();

  if (!mainEvent) {
    console.error('Corporate Lunch Market not found. Run npm run seed:demo first');
    process.exit(1);
  }

  // Vendor terms on main event
  await supabase
    .from('events')
    .update({
      vendor_terms:
        'Demo vendor terms: stall fees due within 7 days of approval. Power hookups billed separately. Refunds if event cancelled.',
    })
    .eq('id', mainEvent.id);

  // Pending vendor with menu + dish pics (organizer review + image preview)
  const pendingToken = 'demovendorpendingmenu1';
  await supabase.from('vendor_applications').delete().eq('access_token', pendingToken);

  const { data: stallA6 } = await supabase
    .from('stalls')
    .select('id')
    .eq('event_id', mainEvent.id)
    .eq('stall_code', 'A6')
    .maybeSingle();

  const indianMenu = [
    { name: 'Pani Puri', price: 60, imageUrl: TINY_DISH_IMAGE },
    { name: 'Bhel Puri', price: 70, imageUrl: TINY_DISH_IMAGE },
    { name: 'Aloo Tikki Chaat', price: 80, imageUrl: TINY_DISH_IMAGE },
    { name: 'Paneer Butter Masala', price: 150, imageUrl: TINY_DISH_IMAGE },
    { name: 'Chole Bhature', price: 130 },
    { name: 'Kadhai Chawal', price: 120 },
  ];

  await supabase.from('vendor_applications').insert({
    event_id: mainEvent.id,
    business_name: 'Mumbai Street Bites',
    truck_name: 'MSB Express',
    owner_name: 'niru bhai',
    email: 'niru.demo@popmarket.dev',
    phone: '9158716817',
    cuisine_type: 'Indian Street Food',
    vendor_type: 'food_truck',
    menu_description: 'Classic Mumbai street snacks and chaat.',
    menu_items: indianMenu,
    status: 'pending',
    access_token: pendingToken,
    preferred_stall_id: stallA6?.id ?? null,
    needs_power: true,
    needs_water: false,
  });

  console.log('  Pending vendor with menu pics (organizer review)');

  // Waived stall fee vendor
  const waivedToken = 'demovendorwaivedfee01';
  await supabase.from('vendor_applications').delete().eq('access_token', waivedToken);

  const { data: waivedApp } = await supabase
    .from('vendor_applications')
    .insert({
      event_id: mainEvent.id,
      business_name: 'Charity Chow',
      owner_name: 'Meera Shah',
      email: 'charity@demo.popmarket.dev',
      phone: '9876500099',
      cuisine_type: 'Comfort Food',
      vendor_type: 'food_stall',
      menu_description: 'Community kitchen specials.',
      menu_items: [{ name: 'Free Sample Bowl', price: 0 }],
      status: 'approved',
      access_token: waivedToken,
    })
    .select('id')
    .single();

  const { data: stallF2 } = await supabase
    .from('stalls')
    .select('id')
    .eq('event_id', mainEvent.id)
    .eq('stall_code', 'F2')
    .maybeSingle();

  if (waivedApp && stallF2) {
    await supabase.from('stall_assignments').insert({
      stall_id: stallF2.id,
      application_id: waivedApp.id,
    });
    await supabase.from('stalls').update({ is_available: false }).eq('id', stallF2.id);
    await supabase.from('payments').insert({
      event_id: mainEvent.id,
      application_id: waivedApp.id,
      amount: 3500,
      platform_fee_amount: 0,
      organizer_net_amount: 3500,
      status: 'waived',
    });
  }

  console.log('  Waived payment vendor + stall assignment');

  // Free RSVP published event
  await supabase.from('events').delete().eq('slug', 'community-picnic-free');

  const { data: freeEvent } = await supabase
    .from('events')
    .insert({
      organizer_id: organizerId,
      title: 'Community Picnic (Free RSVP)',
      slug: 'community-picnic-free',
      description: 'Free entry market — test RSVP without payment.',
      venue_name: 'Powai Lake Promenade',
      venue_address: 'Powai, Mumbai',
      city: 'Mumbai',
      event_date: '2026-08-02',
      start_time: '10:00',
      end_time: '16:00',
      stall_rows: 5,
      stall_cols: 5,
      visitor_capacity: 300,
      stall_fee: 2500,
      rsvp_entry_fee: 0,
      status: 'published',
    })
    .select('id')
    .single();

  if (freeEvent) {
    const letters = 'ABCDE';
    const freeStalls = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        freeStalls.push({
          event_id: freeEvent.id,
          stall_code: `${letters[r]}${c + 1}`,
          row_index: r,
          col_index: c,
          zone: 'food_truck',
          has_power: true,
          is_available: true,
        });
      }
    }
    await supabase.from('stalls').insert(freeStalls);

    await supabase.from('visitor_rsvps').insert({
      event_id: freeEvent.id,
      name: 'Free RSVP Guest',
      email: 'free.rsvp@demo.popmarket.dev',
      party_size: 3,
      status: 'confirmed',
      access_token: 'demofreersvp0000001',
      entry_fee_amount: 0,
      payment_status: 'none',
    });

    console.log('  Free RSVP event (no entry fee) — run npm run seed:showcase for full menus + photos');
  }

  // Commission billing: one paid settlement + leave others outstanding
  const { data: existingSettlement } = await supabase
    .from('commission_settlements')
    .select('id')
    .eq('organizer_id', organizerId)
    .eq('status', 'paid')
    .maybeSingle();

  let settlementId = existingSettlement?.id;

  if (!settlementId) {
    const { data: settlement } = await supabase
      .from('commission_settlements')
      .insert({
        organizer_id: organizerId,
        amount: 175,
        status: 'paid',
        razorpay_payment_id: 'pay_demo_settlement01',
        paid_at: new Date(Date.now() - 86400000).toISOString(),
      })
      .select('id')
      .single();
    settlementId = settlement?.id;
  }

  if (settlementId) {
    const { data: onePaid } = await supabase
      .from('payments')
      .select('id')
      .eq('event_id', mainEvent.id)
      .eq('status', 'paid')
      .is('commission_settled_at', null)
      .limit(1)
      .maybeSingle();

    if (onePaid) {
      await supabase
        .from('payments')
        .update({
          commission_settled_at: new Date(Date.now() - 86400000).toISOString(),
          commission_settlement_id: settlementId,
        })
        .eq('id', onePaid.id);
    }
  }

  console.log('  Commission settlement (paid) + outstanding platform fees');

  // Second organizer (admin multi-client view)
  const client2Id = await getUserId(supabase, CLIENT2_EMAIL);
  if (client2Id) {
    await supabase.from('events').delete().eq('slug', 'client2-summer-market');

    const { data: c2Event } = await supabase
      .from('events')
      .insert({
        organizer_id: client2Id,
        title: 'Client2 Summer Market',
        slug: 'client2-summer-market',
        description: 'Second organizer — free plan, draft event.',
        venue_name: 'Versova Beach',
        venue_address: 'Versova, Mumbai',
        city: 'Mumbai',
        event_date: '2026-09-20',
        start_time: '17:00',
        end_time: '22:00',
        stall_rows: 3,
        stall_cols: 4,
        visitor_capacity: 150,
        stall_fee: 2000,
        rsvp_entry_fee: 0,
        status: 'draft',
      })
      .select('id')
      .single();

    if (c2Event) {
      console.log('  Second organizer draft event (admin organizers list)');
    }
  }

  console.log('\n--- Test matrix URLs ---\n');
  console.log('AUTH');
  console.log(`  Organizer:   ${appUrl}/login  → organizer@popmarket.dev / Demo@12345`);
  console.log(`  Superadmin:  ${appUrl}/admin/login → platform@popmarket.dev / Admin@12345`);
  if (client2Id) {
    console.log(`  Client 2:    ${appUrl}/login  → client2@popmarket.dev / Demo@12345 (free plan)`);
  }
  console.log('\nORGANIZER DASHBOARD');
  console.log(`  Dashboard:        ${appUrl}/dashboard`);
  console.log(`  Billing (fees):   ${appUrl}/dashboard/billing`);
  console.log(`  Applications:     ${appUrl}/dashboard/events/${mainEvent.id}/applications`);
  console.log(`  Stall map:        ${appUrl}/dashboard/events/${mainEvent.id}/stalls`);
  console.log(`  Payments + CSV:   ${appUrl}/dashboard/events/${mainEvent.id}/payments`);
  console.log(`  Vendor terms:     ${appUrl}/dashboard/events/${mainEvent.id}/terms`);
  console.log(`  Draft stalls:     ${appUrl}/dashboard/events (Weekend Food Truck Fest → Generate floor plan)`);
  console.log('\nPUBLIC / VENDOR / RSVP');
  console.log(`  Landing:          ${appUrl}`);
  console.log(`  Paid RSVP event:  ${appUrl}/e/corporate-lunch-market`);
  console.log(`  Free RSVP event:  ${appUrl}/e/community-picnic-free`);
  console.log(`  Vendor apply:     ${appUrl}/apply/corporate-lunch-market`);
  console.log(`  Pending review:   ${appUrl}/vendor/${pendingToken}`);
  console.log(`  Paid + pass:      ${appUrl}/vendor/demovendorpaidmumbai01`);
  console.log(`  Approved unpaid:  ${appUrl}/vendor/demovendorpendingtaco1`);
  console.log(`  Waived fee:       ${appUrl}/vendor/${waivedToken}`);
  console.log(`  Waitlisted:       ${appUrl}/vendor/demovendorwaitlisted01 (if seeded)`);
  console.log(`  Rejected:         ${appUrl}/vendor/demovendorrejected0001 (if seeded)`);
  console.log(`  RSVP paid+QR:     ${appUrl}/rsvp/demorsvpconfirmed00001`);
  console.log(`  RSVP fee due:     ${appUrl}/rsvp/demorsvppendingfee0001`);
  console.log(`  RSVP waitlist:    ${appUrl}/rsvp/demorsvpwaitlisted0001`);
  console.log(`  Free RSVP pass:   ${appUrl}/rsvp/demofreersvp0000001`);
  console.log('\nSUPERADMIN');
  console.log(`  Overview:         ${appUrl}/admin`);
  console.log(`  Organizers:       ${appUrl}/admin/organizers`);
  console.log(`  All events:       ${appUrl}/admin/events`);
  console.log(`  Settings:         ${appUrl}/admin/settings`);
  console.log('\nFUNCTIONALITY CHECKLIST');
  console.log('  [ ] Approve / waitlist / reject vendors (applications table)');
  console.log('  [ ] Stall map assign + hide assigned vendors');
  console.log('  [ ] Razorpay vendor stall payment (approved unpaid)');
  console.log('  [ ] Razorpay RSVP entry fee (fee due page)');
  console.log('  [ ] Vendor pass + RSVP QR print');
  console.log('  [ ] AI menu extract + dish pic preview (apply form)');
  console.log('  [ ] Platform billing — pay outstanding commission');
  console.log('  [ ] Payout CSV export on payments page');
  console.log('  [ ] Admin: organizers search, settings, cross-event view');
  console.log('  [ ] Tables: search / sort / filter / pagination (run seed:large)');
  console.log('\nDone! Test matrix ready.\n');
}

seedTestMatrix().catch((err) => {
  console.error(err);
  process.exit(1);
});
