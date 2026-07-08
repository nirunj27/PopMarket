'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { mapAuthError } from '@/lib/auth/errors';
import { loginSchema, signupSchema } from '@/lib/validations';
import { parseOrganizerPlan } from '@/lib/plans';
import type { ActionResult } from '@/types';

function mapZodErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return error.flatten().fieldErrors;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input', fieldErrors: mapZodErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  if (!data.session) {
    return {
      success: false,
      error: 'Sign in succeeded but no session was created. Confirm your email and try again.',
    };
  }

  return { success: true };
}

export async function signupAction(
  formData: FormData,
): Promise<ActionResult<{ requiresEmailConfirmation?: boolean }>> {
  const raw = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    companyName: formData.get('companyName') || undefined,
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input', fieldErrors: mapZodErrors(parsed.error) };
  }

  const plan = parseOrganizerPlan(formData.get('plan'));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`,
      data: {
        full_name: parsed.data.fullName,
        company_name: parsed.data.companyName,
        plan,
      },
    },
  });

  if (error) {
    const message = mapAuthError(error.message);
    const isDuplicate = error.message.toLowerCase().includes('already registered');
    return {
      success: false,
      error: message,
      fieldErrors: isDuplicate ? { email: [message] } : undefined,
    };
  }

  if (!data.user) {
    return { success: false, error: 'Signup failed. Please try again.' };
  }

  // Profile is auto-created by DB trigger (handle_new_user).
  // Only update optional fields if we already have a session.
  if (data.session) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: parsed.data.fullName,
      company_name: parsed.data.companyName || null,
    });
  }

  if (!data.session) {
    return {
      success: true,
      data: { requiresEmailConfirmation: true },
    };
  }

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
