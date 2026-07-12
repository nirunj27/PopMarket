/**
 * Seeds demo events, vendors, stalls, RSVPs, and payments for UI testing.
 *
 * Usage:
 *   npm run seed:dev   — create organizer account first (if needed)
 *   npm run seed:demo  — load this dummy data
 *
 * Or: npm run seed:all
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const DEMO_ORGANIZER_EMAIL = 'organizer@popmarket.dev';

const DEMO_SLUGS = ['corporate-lunch-market', 'weekend-food-truck-fest'];

/** Fixed tokens → stable localhost URLs in the output below */
const TOKENS = {
  rsvpConfirmed: 'demorsvpconfirmed00001',
  rsvpPendingFee: 'demorsvppendingfee0001',
  rsvpWaitlisted: 'demorsvpwaitlisted0001',
  vendorPaidMumbai: 'demovendorpaidmumbai01',
  vendorPaidNj: 'demovendorpaidnjtruck01',
  vendorPendingTaco: 'demovendorpendingtaco1',
  vendorApprovedUnpaid: 'demovendorapprovedunpd1',
};

const VENDORS = [
  {
    token: TOKENS.vendorPaidMumbai,
    business_name: 'Mumbai Masala Truck',
    truck_name: 'MM Express',
    owner_name: 'Priya Sharma',
    email: 'priya@demo.popmarket.dev',
    phone: '9876500001',
    cuisine_type: 'Indian',
    vendor_type: 'food_truck',
    status: 'approved',
    payment: 'paid',
    stallCode: 'C3',
    menu_description: 'North Indian street food and bowls.',
    menu_items: [
      { name: 'Butter Chicken Bowl', price: 180 },
      { name: 'Masala Dosa', price: 120 },
      { name: 'Paneer Tikka Wrap', price: 150 },
    ],
  },
  {
    token: TOKENS.vendorPaidNj,
    business_name: 'NJ Truck',
    truck_name: 'NJ Smokehouse',
    owner_name: 'Jay Patel',
    email: 'jay@demo.popmarket.dev',
    phone: '9876500002',
    cuisine_type: 'American BBQ',
    vendor_type: 'food_truck',
    status: 'approved',
    payment: 'paid',
    stallCode: 'D4',
    menu_description: 'Smoked meats and classic sides.',
    menu_items: [
      { name: 'Pulled Pork Sandwich', price: 220 },
      { name: 'BBQ Ribs (half rack)', price: 350 },
      { name: 'Mac & Cheese', price: 90 },
    ],
  },
  {
    token: TOKENS.vendorPendingTaco,
    business_name: 'Tacos El Camino',
    truck_name: 'El Camino',
    owner_name: 'Carlos Mendez',
    email: 'carlos@demo.popmarket.dev',
    phone: '9876500003',
    cuisine_type: 'Mexican',
    vendor_type: 'food_stall',
    status: 'approved',
    payment: 'pending',
    stallCode: 'B2',
    menu_description: 'Authentic tacos and quesadillas.',
    menu_items: [
      { name: 'Al Pastor Tacos (3)', price: 160 },
      { name: 'Quesadilla', price: 140 },
      { name: 'Horchata', price: 60 },
    ],
  },
  {
    token: TOKENS.vendorApprovedUnpaid,
    business_name: 'Seoul Kitchen',
    truck_name: 'K-Street',
    owner_name: 'Min-jun Kim',
    email: 'minjun@demo.popmarket.dev',
    phone: '9876500004',
    cuisine_type: 'Korean',
    vendor_type: 'food_stall',
    status: 'approved',
    payment: 'pending',
    stallCode: 'E5',
    menu_description: 'Korean fried chicken and bibimbap.',
    menu_items: [
      { name: 'Bibimbap', price: 200 },
      { name: 'KFC Wings (6pc)', price: 180 },
    ],
  },
  {
    business_name: 'Spice Route',
    owner_name: 'Anita Desai',
    email: 'anita@demo.popmarket.dev',
    phone: '9876500005',
    cuisine_type: 'Thai',
    vendor_type: 'food_stall',
    status: 'pending',
    menu_description: 'Pad thai and curries.',
    menu_items: [
      { name: 'Pad Thai', price: 170 },
      { name: 'Green Curry', price: 190 },
    ],
  },
  {
    business_name: 'Burger Barn',
    owner_name: 'Tom Wilson',
    email: 'tom@demo.popmarket.dev',
    phone: '9876500006',
    cuisine_type: 'American',
    vendor_type: 'food_truck',
    status: 'waitlisted',
    menu_description: 'Smash burgers and fries.',
    menu_items: [{ name: 'Classic Burger', price: 150 }],
  },
  {
    business_name: 'Curry Cart',
    owner_name: 'Ravi Nair',
    email: 'ravi@demo.popmarket.dev',
    phone: '9876500007',
    cuisine_type: 'Indian',
    vendor_type: 'food_stall',
    status: 'rejected',
    rejection_reason: 'Menu overlap with existing Indian vendors at this market.',
    menu_description: 'South Indian breakfast items.',
    menu_items: [{ name: 'Idli Sambar', price: 80 }],
  },
];

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

function stallGrid(rows, cols) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const stalls = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const code = `${letters[r] ?? `R${r}`}${c + 1}`;
      let zone = 'food_truck';

      if (r === 0 && c === Math.floor(cols / 2)) zone = 'entrance';
      else if (r === rows - 1 && c === Math.floor(cols / 2)) zone = 'stage';
      else if (c === 0 || c === cols - 1) zone = 'food_stall';
      else if (r === 0 || r === rows - 1) zone = 'food_stall';

      const isVendorBay = zone === 'food_truck' || zone === 'food_stall';
      const isPremium = isVendorBay && (code === 'C3' || code === 'D4');

      stalls.push({
        stall_code: code,
        row_index: r,
        col_index: c,
        zone,
        has_power: isVendorBay,
        is_available: isVendorBay,
        is_premium: isPremium,
        premium_fee: isPremium ? 500 : 0,
      });
    }
  }

  return stalls;
}

async function getOrganizerId(supabase) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  const user = data.users.find((u) => u.email === DEMO_ORGANIZER_EMAIL);
  if (!user) {
    console.error(`Demo organizer not found. Run: npm run seed:dev`);
    process.exit(1);
  }
  return user.id;
}

async function deleteDemoEvents(supabase, organizerId) {
  const { data: events } = await supabase
    .from('events')
    .select('id, slug')
    .eq('organizer_id', organizerId)
    .in('slug', DEMO_SLUGS);

  if (!events?.length) return;

  for (const event of events) {
    const { error } = await supabase.from('events').delete().eq('id', event.id);
    if (error) throw new Error(`Delete ${event.slug}: ${error.message}`);
    console.log(`  Removed old demo event: ${event.slug}`);
  }
}

async function seedDemoData() {
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

  const organizerId = await getOrganizerId(supabase);

  console.log('Seeding demo data...\n');
  console.log('Cleaning previous demo events...');
  await deleteDemoEvents(supabase, organizerId);

  const eventDate = '2026-07-27';

  const { data: mainEvent, error: eventError } = await supabase
    .from('events')
    .insert({
      organizer_id: organizerId,
      title: 'Corporate Lunch Market',
      slug: 'corporate-lunch-market',
      description:
        'Weekday lunch market for office parks — fast service, diverse cuisines.',
      venue_name: 'Bandra Kurla Complex',
      venue_address: 'Jayprakash Road, Rangar Lane',
      city: 'Mumbai',
      event_date: eventDate,
      setup_time: '10:00',
      start_time: '11:30',
      end_time: '14:30',
      stall_rows: 6,
      stall_cols: 8,
      visitor_capacity: 500,
      stall_fee: 3500,
      rsvp_entry_fee: 99,
      status: 'published',
      vendor_terms: null,
    })
    .select('id')
    .single();

  if (eventError) throw new Error(`Event: ${eventError.message}`);

  const { data: draftEvent, error: draftError } = await supabase
    .from('events')
    .insert({
      organizer_id: organizerId,
      title: 'Weekend Food Truck Fest',
      slug: 'weekend-food-truck-fest',
      description: 'Draft event for dashboard testing — not public yet.',
      venue_name: 'Jio World Garden',
      venue_address: 'Bandra Kurla Complex',
      city: 'Mumbai',
      event_date: '2026-08-15',
      start_time: '12:00',
      end_time: '22:00',
      stall_rows: 4,
      stall_cols: 6,
      visitor_capacity: 2000,
      stall_fee: 5000,
      rsvp_entry_fee: 0,
      status: 'draft',
    })
    .select('id')
    .single();

  if (draftError) throw new Error(`Draft event: ${draftError.message}`);

  const stallRows = stallGrid(6, 8).map((s) => ({ ...s, event_id: mainEvent.id }));
  const { data: stalls, error: stallError } = await supabase
    .from('stalls')
    .insert(stallRows)
    .select('id, stall_code');

  if (stallError) throw new Error(`Stalls: ${stallError.message}`);

  const stallByCode = Object.fromEntries(stalls.map((s) => [s.stall_code, s.id]));

  console.log(`  Event: Corporate Lunch Market (${mainEvent.id})`);
  console.log(`  Stalls: ${stalls.length}`);

  for (const vendor of VENDORS) {
    const token =
      vendor.token ??
      `demo${vendor.business_name.toLowerCase().replace(/\W/g, '').slice(0, 16)}`;

    const { data: app, error: appError } = await supabase
      .from('vendor_applications')
      .insert({
        event_id: mainEvent.id,
        business_name: vendor.business_name,
        truck_name: vendor.truck_name ?? null,
        owner_name: vendor.owner_name,
        email: vendor.email,
        phone: vendor.phone,
        cuisine_type: vendor.cuisine_type,
        vendor_type: vendor.vendor_type,
        menu_description: vendor.menu_description,
        menu_items: vendor.menu_items,
        status: vendor.status,
        rejection_reason: vendor.rejection_reason ?? null,
        access_token: token,
        needs_power: vendor.vendor_type === 'food_truck',
      })
      .select('id')
      .single();

    if (appError) throw new Error(`Vendor ${vendor.business_name}: ${appError.message}`);

    if (vendor.status === 'approved' && vendor.stallCode) {
      const stallId = stallByCode[vendor.stallCode];
      if (stallId) {
        const { error: assignError } = await supabase.from('stall_assignments').insert({
          stall_id: stallId,
          application_id: app.id,
        });
        if (assignError) throw new Error(`Assign ${vendor.business_name}: ${assignError.message}`);

        await supabase.from('stalls').update({ is_available: false }).eq('id', stallId);
      }

      if (vendor.payment) {
        const premium = vendor.stallCode === 'C3' || vendor.stallCode === 'D4' ? 500 : 0;
        const amount = 3500 + premium;
        const platformFee = Math.round((amount * 5) / 100);
        const { error: payError } = await supabase.from('payments').insert({
          event_id: mainEvent.id,
          application_id: app.id,
          amount,
          platform_fee_amount: platformFee,
          organizer_net_amount: amount - platformFee,
          status: vendor.payment,
          paid_at: vendor.payment === 'paid' ? new Date().toISOString() : null,
          razorpay_payment_id: vendor.payment === 'paid' ? `pay_demo_${token.slice(0, 8)}` : null,
        });
        if (payError) throw new Error(`Payment ${vendor.business_name}: ${payError.message}`);
      }
    }
  }

  const rsvps = [
    {
      name: 'Niranjan Kamalakar Jathar',
      email: 'guest.confirmed@demo.popmarket.dev',
      phone: '9876510001',
      party_size: 4,
      status: 'confirmed',
      access_token: TOKENS.rsvpConfirmed,
      entry_fee_amount: 396,
      platform_fee_amount: 20,
      organizer_net_amount: 376,
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      razorpay_payment_id: 'pay_demo_rsvpconfirmed',
    },
    {
      name: 'Alex Rivera',
      email: 'guest.pending@demo.popmarket.dev',
      phone: '9876510002',
      party_size: 2,
      status: 'confirmed',
      access_token: TOKENS.rsvpPendingFee,
      entry_fee_amount: 198,
      platform_fee_amount: 10,
      organizer_net_amount: 188,
      payment_status: 'pending',
    },
    {
      name: 'Sam Taylor',
      email: 'guest.waitlist@demo.popmarket.dev',
      party_size: 6,
      status: 'waitlisted',
      access_token: TOKENS.rsvpWaitlisted,
      entry_fee_amount: 0,
      platform_fee_amount: 0,
      organizer_net_amount: 0,
      payment_status: 'none',
    },
  ];

  for (const rsvp of rsvps) {
    const { error } = await supabase.from('visitor_rsvps').insert({
      event_id: mainEvent.id,
      ...rsvp,
    });
    if (error) throw new Error(`RSVP ${rsvp.name}: ${error.message}`);
  }

  // Extra RSVPs to show capacity usage on public page
  for (let i = 1; i <= 8; i++) {
    const entry = 198;
    const fee = Math.round((entry * 5) / 100);
    const paid = i % 2 === 0;
    await supabase.from('visitor_rsvps').insert({
      event_id: mainEvent.id,
      name: `Demo Guest ${i}`,
      email: `guest${i}@demo.popmarket.dev`,
      party_size: 2,
      status: 'confirmed',
      access_token: `demoguest${String(i).padStart(2, '0')}rsvp000000`,
      entry_fee_amount: entry,
      platform_fee_amount: paid ? fee : 0,
      organizer_net_amount: paid ? entry - fee : 0,
      payment_status: paid ? 'paid' : 'none',
      paid_at: paid ? new Date().toISOString() : null,
    });
  }

  console.log(`  Vendors: ${VENDORS.length}`);
  console.log(`  RSVPs: ${rsvps.length + 8}`);
  console.log(`  Draft event: Weekend Food Truck Fest\n`);

  console.log('--- UI test URLs (localhost) ---\n');
  console.log('Organizer login:');
  console.log('  Email:    organizer@popmarket.dev');
  console.log('  Password: Demo@12345\n');
  console.log('Dashboard:');
  console.log(`  ${appUrl}/dashboard`);
  console.log(`  ${appUrl}/dashboard/events`);
  console.log(`  ${appUrl}/dashboard/events/${mainEvent.id}`);
  console.log(`  ${appUrl}/dashboard/events/${mainEvent.id}/applications`);
  console.log(`  ${appUrl}/dashboard/events/${mainEvent.id}/stalls`);
  console.log(`  ${appUrl}/dashboard/events/${mainEvent.id}/payments`);
  console.log(`  ${appUrl}/dashboard/events/${mainEvent.id}/terms`);
  console.log(`  Draft (no stalls): ${appUrl}/dashboard/events/${draftEvent.id}/stalls\n`);
  console.log('Public event page:');
  console.log(`  ${appUrl}/e/corporate-lunch-market\n`);
  console.log('RSVP status pages:');
  console.log(`  Confirmed (paid + QR):  ${appUrl}/rsvp/${TOKENS.rsvpConfirmed}`);
  console.log(`  Confirmed (fee due):    ${appUrl}/rsvp/${TOKENS.rsvpPendingFee}`);
  console.log(`  Waitlisted:             ${appUrl}/rsvp/${TOKENS.rsvpWaitlisted}\n`);
  console.log('Vendor status pages:');
  console.log(`  Paid + assigned:        ${appUrl}/vendor/${TOKENS.vendorPaidMumbai}`);
  console.log(`  Paid (NJ Truck):        ${appUrl}/vendor/${TOKENS.vendorPaidNj}`);
  console.log(`  Approved, unpaid:       ${appUrl}/vendor/${TOKENS.vendorPendingTaco}`);
  console.log(`  Approved, unpaid #2:    ${appUrl}/vendor/${TOKENS.vendorApprovedUnpaid}\n`);
  console.log('Vendor application:');
  console.log(`  ${appUrl}/apply/corporate-lunch-market\n`);
  console.log('--- Test scenarios ---');
  console.log('  1. Public event + RSVP with entry fee (pay via Razorpay test UPI success@razorpay)');
  console.log('  2. Vendor apply form + terms acceptance');
  console.log('  3. Approve / waitlist / reject vendors (reject modal centered)');
  console.log('  4. Promote waitlisted vendor when open bays exist');
  console.log('  5. Stall map assign (paid bays locked)');
  console.log('  6. Draft event → Generate floor plan');
  console.log('  7. Publish draft, payments history, delete + refund');
  console.log('  8. Print vendor pass & RSVP entry pass\n');
  console.log('Done! Demo data is ready.');
}

seedDemoData().catch((err) => {
  console.error(err);
  process.exit(1);
});
