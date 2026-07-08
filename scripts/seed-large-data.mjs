/**
 * Adds bulk vendor applications and RSVPs to the demo event for table/pagination testing.
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
const VENDOR_COUNT = 60;
const RSVP_COUNT = 120;

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
    .select('id, title')
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
    console.log(`  Removing ${existingVendors.length} previous bulk vendors…`);
    await supabase.from('vendor_applications').delete().eq('event_id', event.id).like(
      'email',
      'bulkvendor%@loadtest.popmarket.dev',
    );
  }

  const { data: existingRsvps } = await supabase
    .from('visitor_rsvps')
    .select('id')
    .eq('event_id', event.id)
    .like('email', 'bulkguest%@loadtest.popmarket.dev');

  if (existingRsvps?.length) {
    console.log(`  Removing ${existingRsvps.length} previous bulk RSVPs…`);
    await supabase.from('visitor_rsvps').delete().eq('event_id', event.id).like(
      'email',
      'bulkguest%@loadtest.popmarket.dev',
    );
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

  const { error: vendorInsertError } = await supabase.from('vendor_applications').insert(vendorRows);
  if (vendorInsertError) throw new Error(`Vendors: ${vendorInsertError.message}`);
  console.log(`  + ${VENDOR_COUNT} vendor applications`);

  const rsvpRows = [];
  for (let i = 1; i <= RSVP_COUNT; i++) {
    const waitlisted = i % 17 === 0;
    rsvpRows.push({
      event_id: event.id,
      name: `Load Test Guest ${i}`,
      email: `bulkguest${String(i).padStart(3, '0')}@loadtest.popmarket.dev`,
      phone: `91000${String(10000 + i).slice(-5)}`,
      party_size: (i % 4) + 1,
      status: waitlisted ? 'waitlisted' : 'confirmed',
      access_token: token('bulkrspv', i),
      entry_fee_amount: waitlisted ? 0 : 99 * ((i % 4) + 1),
      payment_status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'pending' : 'none',
    });
  }

  const { error: rsvpInsertError } = await supabase.from('visitor_rsvps').insert(rsvpRows);
  if (rsvpInsertError) throw new Error(`RSVPs: ${rsvpInsertError.message}`);
  console.log(`  + ${RSVP_COUNT} visitor RSVPs`);

  console.log('\n--- Load test URLs ---\n');
  console.log(`Applications table (search/sort/pagination):`);
  console.log(`  ${appUrl}/dashboard/events/${event.id}/applications`);
  console.log(`Payments history:`);
  console.log(`  ${appUrl}/dashboard/events/${event.id}/payments`);
  console.log(`Public event:`);
  console.log(`  ${appUrl}/e/${DEMO_SLUG}`);
  console.log(`Sample bulk vendor status:`);
  console.log(`  ${appUrl}/vendor/${token('bulkvendor', 1)}`);
  console.log(`Sample bulk RSVP:`);
  console.log(`  ${appUrl}/rsvp/${token('bulkrspv', 1)}`);
  console.log('\nDone! Large dataset ready for UI testing.\n');
}

seedLargeData().catch((err) => {
  console.error(err);
  process.exit(1);
});
