import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/forms/login-form';
import { AuthHeader } from '@/components/layout/auth-header';
import { PageContainer } from '@/components/layout/page-container';

export const metadata: Metadata = {
  title: 'Organizer login',
};

export default function LoginPage() {
  return (
    <div className="market-pattern flex min-h-screen flex-col">
      <AuthHeader />
      <main id="main-content" className="flex flex-1 items-center">
        <PageContainer className="flex w-full justify-center py-12">
          <div className="w-full max-w-md space-y-6">
            <LoginForm variant="organizer" />
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-primary underline-offset-4 transition-base hover:underline"
              >
                Sign up
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Platform team?{' '}
              <Link
                href="/admin/login"
                className="font-semibold text-secondary underline-offset-4 transition-base hover:underline"
              >
                Superadmin login
              </Link>
            </p>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
