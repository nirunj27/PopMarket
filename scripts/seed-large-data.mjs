/**
 * Adds bulk vendors, RSVPs, and paid transactions for load / pagination testing.
 *
 * Usage (after demo seed):
 *   npm run seed:large
 *
 * Or full reset + demo + large:
 *   npm run reset:seed:large
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const DEMO_SLUG = 'corporate-lunch-market';
const VENDOR_COUNT = 80;
const RSVP_COUNT = 200;
const FEE_PERCENT = 5;

const CUISINES = [
  'Indian',
  'Mexican',
  'Thai',
  'American BBQ',
  'Japanese',
  'Italian',
  'Korean',
  'Mediterranean',
  'Chinese',
  'Street Food',
];

const STATUSES = ['pending', 'pending', 'pending', 'approved', 'waitlisted', 'rejected'];

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

function token(prefix, n) {
  return `${prefix}${String(n).padStart(6, '0')}`;
}

function splitFee(gross) {
  const platformFee = Math.round((gross * FEE_PERCENT) / 100);
  return { platformFee, organizerNet: Math.max(0, gross - platformFee) };
}

async function seedLargeData() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, stall_fee')
    .eq('slug', DEMO_SLUG)
    .single();

  if (eventError || !event) {
    console.error(`Event "${DEMO_SLUG}" not found. Run: npm run seed:demo`);
    process.exit(1);
  }

  console.log(`\nSeeding large dataset on: ${event.title}\n`);

  const { data: existingVendors } = await supabase
    .from('vendor_applications')
    .select('id')
    .eq('event_id', event.id)
    .like('email', 'bulkvendor%@loadtest.popmarket.dev');

  if (existingVendors?.length) {
    const ids = existingVendors.map((v) => v.id);
    await supabase.from('payments').delete().in('application_id', ids);
    console.log(`  Removing ${existingVendors.length} previous bulk vendors…`);
    await supabase
      .from('vendor_applications')
      .delete()
      .eq('event_id', event.id)
      .like('email', 'bulkvendor%@loadtest.popmarket.dev');
  }

  const { data: existingRsvps } = await supabase
    .from('visitor_rsvps')
    .select('id')
    .eq('event_id', event.id)
    .like('email', 'bulkguest%@loadtest.popmarket.dev');

  if (existingRsvps?.length) {
    console.log(`  Removing ${existingRsvps.length} previous bulk RSVPs…`);
    await supabase
      .from('visitor_rsvps')
      .delete()
      .eq('event_id', event.id)
      .like('email', 'bulkguest%@loadtest.popmarket.dev');
  }

  const vendorRows = [];
  for (let i = 1; i <= VENDOR_COUNT; i++) {
    const cuisine = CUISINES[i % CUISINES.length];
    const status = STATUSES[i % STATUSES.length];
    vendorRows.push({
      event_id: event.id,
      business_name: `Load Test Truck ${i}`,
      truck_name: `Truck #${i}`,
      owner_name: `Vendor Owner ${i}`,
      email: `bulkvendor${String(i).padStart(3, '0')}@loadtest.popmarket.dev`,
      phone: `90000${String(10000 + i).slice(-5)}`,
      cuisine_type: cuisine,
      vendor_type: i % 3 === 0 ? 'food_stall' : 'food_truck',
      status,
      access_token: token('bulkvendor', i),
      menu_description: `Sample menu for ${cuisine} truck ${i}.`,
      menu_items: [
        { name: 'Special Item A', price: 80 + (i % 5) * 20 },
        { name: 'Special Item B', price: 120 + (i % 4) * 15 },
        { name: 'Combo Plate', price: 199 + (i % 3) * 10 },
      ],
      needs_power: i % 4 === 0,
      needs_water: i % 5 === 0,
      rejection_reason: status === 'rejected' ? 'Duplicate cuisine category for this market.' : null,
    });
  }

  const { data: insertedVendors, error: vendorInsertError } = await supabase
    .from('vendor_applications')
    .insert(vendorRows)
    .select('id, status, access_token');

  if (vendorInsertError) throw new Error(`Vendors: ${vendorInsertError.message}`);
  console.log(`  + ${VENDOR_COUNT} vendor applications`);

  const stallFee = Number(event.stall_fee) || 3500;
  const paymentRows = [];
  for (const app of insertedVendors ?? []) {
    if (app.status !== 'approved') continue;
    const n = Number(String(app.access_token).replace(/\D/g, '')) || 1;
    const amount = stallFee + (n % 2 === 0 ? 500 : 0);
    const { platformFee, organizerNet } = splitFee(amount);
    const paid = n % 3 !== 0;
    paymentRows.push({
      event_id: event.id,
      application_id: app.id,
      amount,
      platform_fee_amount: platformFee,
      organizer_net_amount: organizerNet,
      status: paid ? 'paid' : 'pending',
      paid_at: paid ? new Date().toISOString() : null,
      razorpay_payment_id: paid ? `pay_bulk_${app.access_token.slice(-8)}` : null,
    });
  }

  if (paymentRows.length) {
    const { error: payError } = await supabase.from('payments').insert(paymentRows);
    if (payError) throw new Error(`Payments: ${payError.message}`);
    console.log(`  + ${paymentRows.length} vendor payment rows`);
  }

  const rsvpRows = [];
  for (let i = 1; i <= RSVP_COUNT; i++) {
    const waitlisted = i % 17 === 0;
    const party = (i % 4) + 1;
    const entry = waitlisted ? 0 : 99 * party;
    const paid = !waitlisted && i % 3 === 0;
    const pending = !waitlisted && i % 3 === 1;
    const { platformFee, organizerNet } = paid ? splitFee(entry) : { platformFee: 0, organizerNet: 0 };
    rsvpRows.push({
      event_id: event.id,
      name: `Load Test Guest ${i}`,
      email: `bulkguest${String(i).padStart(3, '0')}@loadtest.popmarket.dev`,
      phone: `91000${String(10000 + i).slice(-5)}`,
      party_size: party,
      status: waitlisted ? 'waitlisted' : 'confirmed',
      access_token: token('bulkrspv', i),
      entry_fee_amount: entry,
      platform_fee_amount: platformFee,
      organizer_net_amount: organizerNet,
      payment_status: paid ? 'paid' : pending ? 'pending' : 'none',
      paid_at: paid ? new Date().toISOString() : null,
    });
  }

  const { error: rsvpInsertError } = await supabase.from('visitor_rsvps').insert(rsvpRows);
  if (rsvpInsertError) throw new Error(`RSVPs: ${rsvpInsertError.message}`);
  console.log(`  + ${RSVP_COUNT} visitor RSVPs`);

  // Second published market for admin multi-event views
  const { data: organizer } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', event.id)
    .single();

  if (organizer?.organizer_id) {
    const { data: existingNight } = await supabase
      .from('events')
      .select('id')
      .eq('slug', 'night-bazaar-market')
      .maybeSingle();

    if (existingNight) {
      await supabase.from('events').delete().eq('id', existingNight.id);
    }

    const { data: nightEvent, error: nightError } = await supabase
      .from('events')
      .insert({
        organizer_id: organizer.organizer_id,
        title: 'Night Bazaar Market',
        slug: 'night-bazaar-market',
        description: 'Evening street-food market for load testing public pages and admin lists.',
        venue_name: 'Phoenix Mills Courtyard',
        venue_address: 'Lower Parel',
        city: 'Mumbai',
        event_date: '2026-09-12',
        setup_time: '16:00',
        start_time: '18:00',
        end_time: '23:00',
        stall_rows: 5,
        stall_cols: 6,
        visitor_capacity: 1200,
        stall_fee: 4500,
        rsvp_entry_fee: 149,
        status: 'published',
      })
      .select('id')
      .single();

    if (nightError) throw new Error(`Night event: ${nightError.message}`);

    const nightVendors = [];
    for (let i = 1; i <= 25; i++) {
      nightVendors.push({
        event_id: nightEvent.id,
        business_name: `Night Market Stall ${i}`,
        owner_name: `Night Vendor ${i}`,
        email: `nightvendor${String(i).padStart(3, '0')}@loadtest.popmarket.dev`,
        phone: `92000${String(10000 + i).slice(-5)}`,
        cuisine_type: CUISINES[i % CUISINES.length],
        vendor_type: i % 2 === 0 ? 'food_stall' : 'food_truck',
        status: STATUSES[i % STATUSES.length],
        access_token: token('nightvnd', i),
        menu_description: `Night market menu ${i}`,
        menu_items: [{ name: 'Signature Plate', price: 150 + i }],
      });
    }
    const { error: nvErr } = await supabase.from('vendor_applications').insert(nightVendors);
    if (nvErr) throw new Error(`Night vendors: ${nvErr.message}`);

    const nightRsvps = [];
    for (let i = 1; i <= 40; i++) {
      const entry = 149 * ((i % 3) + 1);
      const paid = i % 2 === 0;
      const { platformFee, organizerNet } = paid ? splitFee(entry) : { platformFee: 0, organizerNet: 0 };
      nightRsvps.push({
        event_id: nightEvent.id,
        name: `Night Guest ${i}`,
        email: `nightguest${String(i).padStart(3, '0')}@loadtest.popmarket.dev`,
        party_size: (i % 3) + 1,
        status: 'confirmed',
        access_token: token('nightrsvp', i),
        entry_fee_amount: entry,
        platform_fee_amount: platformFee,
        organizer_net_amount: organizerNet,
        payment_status: paid ? 'paid' : 'pending',
        paid_at: paid ? new Date().toISOString() : null,
      });
    }
    const { error: nrErr } = await supabase.from('visitor_rsvps').insert(nightRsvps);
    if (nrErr) throw new Error(`Night RSVPs: ${nrErr.message}`);
    console.log(`  + Night Bazaar Market (25 vendors, 40 RSVPs)`);
  }

  console.log('\n--- Load test URLs ---\n');
  console.log(`Applications table:`);
  console.log(`  ${appUrl}/dashboard/events/${event.id}/applications`);
  console.log(`Payments:`);
  console.log(`  ${appUrl}/dashboard/events/${event.id}/payments`);
  console.log(`Public event:`);
  console.log(`  ${appUrl}/e/${DEMO_SLUG}`);
  console.log(`  ${appUrl}/e/night-bazaar-market`);
  console.log(`Admin overview:`);
  console.log(`  ${appUrl}/admin`);
  console.log('\nDone! Large dataset ready.\n');
}

seedLargeData().catch((err) => {
  console.error(err);
  process.exit(1);
});
