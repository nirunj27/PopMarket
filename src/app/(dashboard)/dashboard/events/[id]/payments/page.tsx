import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { PaymentHistory } from '@/components/features/payments/payment-history';
import { getEventById, getPaymentsForEvent } from '@/lib/queries/events';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface PaymentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventPaymentsPage({ params }: PaymentsPageProps) {
  const { id } = await params;
  const [event, payments] = await Promise.all([getEventById(id), getPaymentsForEvent(id)]);

  if (!event) notFound();

  const vendorRevenue = payments
    .filter((p) => p.type === 'vendor' && p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);
  const rsvpRevenue = payments
    .filter((p) => p.type === 'rsvp' && p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/events/${id}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <PageHeader
        title="Payment history"
        description={`Revenue and transactions for ${event.title}`}
      />

      <PaymentHistory
        payments={payments}
        vendorRevenue={vendorRevenue}
        rsvpRevenue={rsvpRevenue}
        eventTitle={event.title}
        eventId={event.id}
      />
    </div>
  );
}
