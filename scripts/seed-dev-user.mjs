/**
 * Creates demo organizer + platform superadmin accounts for local development.
 *
 * Usage: npm run seed:dev
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

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

const DEMO_USERS = [
  {
    email: 'organizer@popmarket.dev',
    password: 'Demo@12345',
    fullName: 'Demo Organizer',
    companyName: 'PopMarket Events',
    phone: '9876543210',
    address: '12 Market Lane, Andheri West, Mumbai 400053',
    role: 'organizer',
    plan: 'paid',
    portal: 'http://localhost:3000/login',
  },
  {
    email: 'platform@popmarket.dev',
    password: 'Admin@12345',
    fullName: 'Platform Admin',
    companyName: 'PopMarket OS',
    phone: '9999900000',
    address: 'PopMarket HQ, Bengaluru',
    role: 'superadmin',
    plan: 'paid',
    portal: 'http://localhost:3000/admin/login',
  },
];

async function upsertDemoUser(supabase, user) {
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const found = existing.users.find((u) => u.email === user.email);

  if (found) {
    await supabase.auth.admin.updateUserById(found.id, {
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        company_name: user.companyName,
        phone: user.phone,
        address: user.address,
        plan: user.plan,
        role: user.role,
      },
    });

    await supabase.from('profiles').upsert({
      id: found.id,
      full_name: user.fullName,
      company_name: user.companyName,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });

    console.log(`Updated: ${user.email} (${user.role})`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      full_name: user.fullName,
      company_name: user.companyName,
      phone: user.phone,
      address: user.address,
      plan: user.plan,
      role: user.role,
    },
  });

  if (error) {
    console.error(`Failed to create ${user.email}:`, error.message);
    process.exit(1);
  }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: user.fullName,
      company_name: user.companyName,
      phone: user.phone,
      address: user.address,
      role: user.role,
    });
  }

  console.log(`Created: ${user.email} (${user.role})`);
}

async function seedDevUsers() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of DEMO_USERS) {
    await upsertDemoUser(supabase, user);
  }

  console.log('\n--- Demo credentials ---');
  for (const user of DEMO_USERS) {
    console.log(`\n${user.role.toUpperCase()}`);
    console.log(`  Email:    ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Portal:   ${user.portal}`);
  }
  console.log('\n------------------------\n');
}

seedDevUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
