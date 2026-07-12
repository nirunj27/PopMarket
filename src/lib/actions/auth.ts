'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mapAuthError } from '@/lib/auth/errors';
import { loginSchema, signupSchema } from '@/lib/validations';
import { parseOrganizerPlan } from '@/lib/plans';
import { formatZodFieldErrors, firstZodError } from '@/lib/validations/helpers';
import { homePathForRole, resolveUserRole, type AppRole } from '@/lib/auth/roles';
import type { ActionResult } from '@/types';
import type { z } from 'zod';

function mapZodErrors(error: z.ZodError) {
  return formatZodFieldErrors(error);
}

export async function loginAction(
  formData: FormData,
): Promise<ActionResult<{ role: AppRole; redirectTo: string }>> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: firstZodError(parsed.error),
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const expectedRole = String(formData.get('expectedRole') || 'organizer') as AppRole;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  if (!data.session || !data.user) {
    return {
      success: false,
      error: 'Sign in succeeded but no session was created. Confirm your email and try again.',
    };
  }

  const role = await resolveUserRole(data.user.id, data.user.email);

  // Sync role into auth metadata for middleware hints
  await supabase.auth.updateUser({ data: { role } });

  if (expectedRole === 'superadmin' && role !== 'superadmin') {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'This account is not a platform admin. Use the organizer login instead.',
    };
  }

  if (expectedRole === 'organizer' && role === 'superadmin') {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'Platform admin accounts use the Superadmin login at /admin/login — not the organizer portal.',
    };
  }

  return {
    success: true,
    data: { role, redirectTo: homePathForRole(role) },
  };
}

export async function signupAction(
  formData: FormData,
): Promise<ActionResult<{ redirectTo?: string }>> {
  const raw = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    companyName: formData.get('companyName'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp') || '',
    address: formData.get('address'),
    city: formData.get('city'),
    pincode: formData.get('pincode'),
    gstin: formData.get('gstin') || '',
    website: formData.get('website') || '',
    about: formData.get('about') || '',
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    acceptedTerms: formData.get('acceptedTerms') === 'true',
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: firstZodError(parsed.error),
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const plan = parseOrganizerPlan(formData.get('plan'));
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp || null,
      address: parsed.data.address,
      city: parsed.data.city,
      pincode: parsed.data.pincode,
      gstin: parsed.data.gstin || null,
      website: parsed.data.website || null,
      about: parsed.data.about || null,
      plan,
      role: 'organizer',
    },
  });

  if (error) {
    const message = mapAuthError(error.message);
    const isDuplicate =
      error.message.toLowerCase().includes('already') ||
      error.message.toLowerCase().includes('registered');
    return {
      success: false,
      error: message,
      fieldErrors: isDuplicate ? { email: [message] } : undefined,
    };
  }

  if (!data.user) {
    return { success: false, error: 'Signup failed. Please try again.' };
  }

  await admin.from('profiles').upsert({
    id: data.user.id,
    full_name: parsed.data.fullName,
    company_name: parsed.data.companyName,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp || null,
    address: parsed.data.address,
    city: parsed.data.city,
    pincode: parsed.data.pincode,
    gstin: parsed.data.gstin || null,
    website: parsed.data.website || null,
    about: parsed.data.about || null,
    role: 'organizer',
    accepted_terms_at: new Date().toISOString(),
    accepted_terms_version: formData.get('termsVersion') || null,
  });

  return {
    success: true,
    data: { redirectTo: '/login' },
  };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
