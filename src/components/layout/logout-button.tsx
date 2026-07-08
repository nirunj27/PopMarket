'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      setOpen(false);
      router.push('/');
      router.refresh();
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        type="button"
        onClick={() => setOpen(true)}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>

      <ConfirmDialog
        open={open}
        title="Log out?"
        description="You will be signed out of your organizer account and returned to the home page."
        confirmLabel="Log out"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
