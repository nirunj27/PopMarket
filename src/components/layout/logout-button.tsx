'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { queueToast } from '@/lib/toast-queue';

interface LogoutButtonProps {
  /** Where to send the user after logout */
  redirectTo?: string;
}

export function LogoutButton({ redirectTo = '/' }: LogoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const destLabel = redirectTo.startsWith('/admin')
    ? 'the admin login page'
    : redirectTo === '/'
      ? 'the home page'
      : 'the login page';

  const handleConfirm = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      queueToast('Signed out successfully');
      setOpen(false);
      router.replace(redirectTo);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-full cursor-pointer justify-start gap-3"
        type="button"
        onClick={() => setOpen(true)}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>

      <ConfirmDialog
        open={open}
        title="Log out?"
        description={`You will be signed out and returned to ${destLabel}.`}
        confirmLabel="Log out"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
