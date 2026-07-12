'use server';

import { revalidatePath } from 'next/cache';
import { platformSettingsSchema } from '@/lib/validations';
import { requireSuperadmin } from '@/lib/platform/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatZodFieldErrors, firstZodError } from '@/lib/validations/helpers';
import type { ActionResult } from '@/types';

export async function updatePlatformSettingsAction(
  formData: FormData,
): Promise<ActionResult> {
  const gate = await requireSuperadmin();
  if (!gate.ok) return { success: false, error: gate.error };

  const raw = {
    platformFeePercent: formData.get('platformFeePercent'),
    razorpayKeyId: formData.get('razorpayKeyId') || '',
    razorpayKeySecret: formData.get('razorpayKeySecret') || '',
    platformEnabled:
      formData.get('platformEnabled') === 'true' || formData.get('platformEnabled') === 'on',
  };

  const parsed = platformSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: firstZodError(parsed.error),
      fieldErrors: formatZodFieldErrors(parsed.error),
    };
  }

  const update: Record<string, unknown> = {
    id: 1,
    platform_fee_percent: parsed.data.platformFeePercent,
    platform_enabled: parsed.data.platformEnabled,
    updated_at: new Date().toISOString(),
    updated_by: gate.user?.id,
  };

  if (parsed.data.razorpayKeyId) {
    update.razorpay_key_id = parsed.data.razorpayKeyId;
  }
  if (parsed.data.razorpayKeySecret) {
    update.razorpay_key_secret = parsed.data.razorpayKeySecret;
  }

  // Service role bypasses RLS (no insert/update policy for authenticated users)
  const admin = createAdminClient();
  const { error } = await admin.from('platform_settings').upsert(update);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/settings');
  return { success: true };
}

export async function deleteOrganizerAction(organizerId: string): Promise<ActionResult> {
  const gate = await requireSuperadmin();
  if (!gate.ok) return { success: false, error: gate.error };

  if (gate.user?.id === organizerId) {
    return { success: false, error: 'You cannot delete your own account' };
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', organizerId)
    .maybeSingle();

  if (!profile) return { success: false, error: 'Organizer not found' };
  if (profile.role === 'superadmin') {
    return { success: false, error: 'Cannot delete a platform admin from this list' };
  }

  const { error } = await admin.auth.admin.deleteUser(organizerId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  revalidatePath('/admin/organizers');
  return { success: true };
}
