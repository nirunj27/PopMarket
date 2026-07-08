'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteEventAction } from '@/lib/actions/events';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
}

export function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await deleteEventAction(eventId);

      if (!result.success) {
        toast.error(result.error ?? 'Failed to delete event');
        setOpen(false);
        return;
      }

      const refunds = result.data?.refundsIssued ?? 0;
      const errors = result.data?.refundErrors ?? [];
      if (refunds > 0) {
        toast.success(`Event deleted · ${refunds} Razorpay refund${refunds === 1 ? '' : 's'} issued`);
      } else {
        toast.success('Event deleted successfully');
      }
      if (errors.length > 0) {
        toast.warning(`Some refunds could not be processed: ${errors[0]}`);
      }
      router.push('/dashboard/events');
      router.refresh();
    });
  };

  return (
    <>
      <Button variant="destructive" type="button" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Delete event
      </Button>

      <ConfirmDialog
        open={open}
        title="Delete this event?"
        description={`"${eventTitle}" and all related data will be permanently removed. Paid vendor stall fees and RSVP entry fees will be refunded via Razorpay where possible. This cannot be undone.`}
        confirmLabel="Delete & refund"
        variant="destructive"
        isLoading={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
