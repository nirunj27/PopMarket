/**
 * Creates a demo organizer account in Supabase for local development.
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

const DEMO_USER = {
  email: 'organizer@popmarket.dev',
  password: 'Demo@12345',
  fullName: 'Demo Organizer',
  companyName: 'PopMarket Events',
};

async function seedDevUser() {
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

  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === DEMO_USER.email);

  if (found) {
    await supabase.auth.admin.updateUserById(found.id, {
      password: DEMO_USER.password,
      email_confirm: true,
      user_metadata: {
        full_name: DEMO_USER.fullName,
        company_name: DEMO_USER.companyName,
        plan: 'paid',
      },
    });

    await supabase.from('profiles').upsert({
      id: found.id,
      full_name: DEMO_USER.fullName,
      company_name: DEMO_USER.companyName,
    });

    console.log('Demo user already exists — password reset and profile updated.');
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      email_confirm: true,
      user_metadata: {
        full_name: DEMO_USER.fullName,
        company_name: DEMO_USER.companyName,
        plan: 'paid',
      },
    });

    if (error) {
      console.error('Failed to create demo user:', error.message);
      process.exit(1);
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: DEMO_USER.fullName,
        company_name: DEMO_USER.companyName,
      });
    }

    console.log('Demo user created successfully.');
  }

  console.log('\n--- Demo sign-in credentials ---');
  console.log(`Email:    ${DEMO_USER.email}`);
  console.log(`Password: ${DEMO_USER.password}`);
  console.log('--------------------------------\n');
  console.log('Sign in at http://localhost:3000/login');
}

seedDevUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
