import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm } from '@/components/forms/signup-form';
import { AuthHeader } from '@/components/layout/auth-header';
import { PageContainer } from '@/components/layout/page-container';
import { parseOrganizerPlan } from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Sign up',
};

interface SignupPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { plan: planParam } = await searchParams;
  const plan = parseOrganizerPlan(planParam);

  return (
    <div className="market-pattern flex min-h-screen flex-col">
      <AuthHeader />
      <main id="main-content" className="flex flex-1 items-center">
        <PageContainer className="flex w-full justify-center py-12">
          <div className="w-full max-w-md space-y-6">
            <SignupForm plan={plan} />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary underline-offset-4 transition-base hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
