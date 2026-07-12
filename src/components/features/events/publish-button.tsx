'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { publishEventAction } from '@/lib/actions/events';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

interface PublishButtonProps {
  eventId: string;
}

export function PublishButton({ eventId }: PublishButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishEventAction(eventId);
      if (result.success) {
        toast.success('Event published! Vendor apply link is live.');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to publish');
      }
    });
  };

  return (
    <Button onClick={handlePublish} isLoading={isPending} variant="secondary">
      <Globe className="h-4 w-4" />
      Publish event
    </Button>
  );
}
