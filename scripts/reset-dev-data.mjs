/**
 * Wipes all app data and recreates the demo organizer account.
 *
 * Usage: npm run reset:dev
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

async function clearTable(supabase, table) {
  const { error, count } = await supabase.from(table).delete({ count: 'exact' }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (error && !error.message.includes('does not exist')) {
    throw new Error(`${table}: ${error.message}`);
  }
  return count ?? 0;
}

async function clearStorage(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const covers = buckets?.find((b) => b.name === 'event-covers');
  if (!covers) return 0;

  const { data: topLevel } = await supabase.storage.from('event-covers').list('', { limit: 1000 });
  if (!topLevel?.length) return 0;

  let removed = 0;
  for (const folder of topLevel) {
    const { data: files } = await supabase.storage.from('event-covers').list(folder.name, { limit: 1000 });
    if (!files?.length) continue;
    const paths = files.map((f) => `${folder.name}/${f.name}`);
    const { error } = await supabase.storage.from('event-covers').remove(paths);
    if (error) console.warn(`Storage warning (${folder.name}):`, error.message);
    else removed += paths.length;
  }
  return removed;
}

async function resetDevData() {
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

  console.log('Clearing application data...\n');

  const tables = [
    'payments',
    'stall_assignments',
    'vendor_applications',
    'visitor_rsvps',
    'stalls',
    'events',
  ];

  for (const table of tables) {
    const count = await clearTable(supabase, table);
    console.log(`  ${table}: ${count} rows deleted`);
  }

  const filesRemoved = await clearStorage(supabase);
  console.log(`  event-covers storage: ${filesRemoved} files removed`);

  console.log('\nRemoving all auth users...');
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;

  for (const user of userList.users) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) console.warn(`  Could not delete ${user.email}:`, error.message);
    else console.log(`  Deleted user: ${user.email ?? user.id}`);
  }

  console.log('\nDatabase is empty. Run npm run seed:all to load demo organizer + UI test data.\n');
}

resetDevData().catch((err) => {
  console.error(err);
  process.exit(1);
});
