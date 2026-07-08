import { notFound } from 'next/navigation';
import {
  getApplicationByToken,
  getPaymentByApplicationId,
  getAssignedStallForApplication,
} from '@/lib/queries/events';
import { ensureVendorPaymentRecord } from '@/lib/payments/ensure-payment';
import { createClient } from '@/lib/supabase/server';
import { VendorStatusPortal } from '@/components/features/vendors/vendor-status-portal';

interface VendorStatusPageProps {
  params: Promise<{ token: string }>;
}

export default async function VendorStatusPage({ params }: VendorStatusPageProps) {
  const { token } = await params;
  const application = await getApplicationByToken(token);

  if (!application) notFound();

  const event = application.events as {
    title: string;
    event_date: string;
    venue_name: string;
    city: string;
    stall_fee: number;
  };

  if (application.status === 'approved') {
    await ensureVendorPaymentRecord(application.id);
  }

  const [payment, assignedStall] = await Promise.all([
    getPaymentByApplicationId(application.id),
    getAssignedStallForApplication(application.id),
  ]);

  const supabase = await createClient();
  const preferredStall = application.preferred_stall_id
    ? (
        await supabase
          .from('stalls')
          .select('stall_code, is_premium, premium_fee')
          .eq('id', application.preferred_stall_id)
          .maybeSingle()
      ).data
    : null;

  return (
    <main id="main-content" className="flex-1">
      <VendorStatusPortal
        accessToken={token}
        application={application}
        event={event}
        payment={payment}
        assignedStall={assignedStall}
        preferredStall={preferredStall}
      />
    </main>
  );
}
