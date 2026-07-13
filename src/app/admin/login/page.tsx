import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/login-form';
import { AuthHeader } from '@/components/layout/auth-header';
import { PageContainer } from '@/components/layout/page-container';
import { AdminLoginSessionNotice } from '@/components/auth/admin-login-session-notice';
import { resolveUserRole } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin login',
};

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organizerEmail: string | null = null;
  if (user?.email) {
    const role = await resolveUserRole(user.id, user.email);
    if (role === 'organizer') {
      organizerEmail = user.email;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AuthHeader />
      <main id="main-content" className="flex flex-1 items-center">
        <PageContainer className="flex w-full justify-center py-12">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-md">
                <Shield className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                PopMarket platform
              </p>
            </div>

            {organizerEmail && <AdminLoginSessionNotice email={organizerEmail} />}

            <LoginForm variant="superadmin" />

            <p className="text-center text-sm text-muted-foreground">
              Organizer?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in to your market dashboard
              </Link>
            </p>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
