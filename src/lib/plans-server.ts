import { parseOrganizerPlan, type OrganizerPlan } from '@/lib/plans';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getOrganizerPlan(
  supabase: SupabaseClient,
  userId?: string,
): Promise<OrganizerPlan> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id && (!userId || user.id === userId)) {
    return parseOrganizerPlan(user.user_metadata?.plan);
  }

  return 'free';
}
