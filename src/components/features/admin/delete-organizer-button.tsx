'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrganizerAction } from '@/lib/actions/platform';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface DeleteOrganizerButtonProps {
  organizerId: string;
  name: string;
}

export function DeleteOrganizerButton({ organizerId, name }: DeleteOrganizerButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        title="Delete organizer?"
        description={`Permanently delete ${name} and all related events. This cannot be undone.`}
        confirmLabel="Delete organizer"
        variant="destructive"
        isLoading={isPending}
        onConfirm={() => {
          startTransition(async () => {
            const result = await deleteOrganizerAction(organizerId);
            if (!result.success) {
              toast.error(result.error ?? 'Delete failed');
              return;
            }
            toast.success('Organizer deleted');
            router.replace('/admin/organizers');
            router.refresh();
          });
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
