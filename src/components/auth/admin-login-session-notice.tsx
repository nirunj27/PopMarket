'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { queueToast } from '@/lib/toast-queue';

interface AdminLoginSessionNoticeProps {
  email: string;
}

export function AdminLoginSessionNotice({ email }: AdminLoginSessionNoticeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      queueToast('Signed out — you can sign in with a platform admin account');
      router.refresh();
    });
  };

  return (
    <div
      className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      role="status"
    >
      Signed in as <span className="font-medium text-foreground">{email}</span> (organizer).{' '}
      <Link href="/dashboard" className="font-semibold text-primary hover:underline">
        Go to dashboard
      </Link>{' '}
      or{' '}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="font-semibold text-primary hover:underline disabled:opacity-60"
      >
        sign out
      </button>{' '}
      to use a platform admin account below.
    </div>
  );
}
