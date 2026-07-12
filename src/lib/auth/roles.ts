import { createClient } from '@/lib/supabase/server';
import { isSuperadminEmail } from '@/lib/env';

export type AppRole = 'organizer' | 'superadmin';

export async function resolveUserRole(
  userId: string,
  email?: string | null,
): Promise<AppRole> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.role === 'superadmin' || isSuperadminEmail(email)) {
    if (profile && profile.role !== 'superadmin' && isSuperadminEmail(email)) {
      await supabase.from('profiles').update({ role: 'superadmin' }).eq('id', userId);
    }
    return 'superadmin';
  }

  return 'organizer';
}

export function homePathForRole(role: AppRole): string {
  return role === 'superadmin' ? '/admin' : '/dashboard';
}
