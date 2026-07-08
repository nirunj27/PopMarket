'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { createRsvpPaymentOrderAction, verifyRsvpPaymentAction } from '@/lib/actions/events';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/payments/load-razorpay';
import { toast } from 'sonner';
import { Ticket } from 'lucide-react';

interface RsvpPaymentButtonProps {
  accessToken: string;
  amount: number;
  guestName: string;
  email: string;
  eventTitle: string;
  onPaid?: () => void;
}

export function RsvpPaymentButton({
  accessToken,
  amount,
  guestName,
  email,
  eventTitle,
  onPaid,
}: RsvpPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const orderResult = await createRsvpPaymentOrderAction(accessToken);
      if (!orderResult.success || !orderResult.data) {
        toast.error(orderResult.error ?? 'Could not start payment');
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Hard refresh and try again.');
        return;
      }

      const { orderId, keyId } = orderResult.data;
      const opened = openRazorpayCheckout({
        keyId,
        orderId,
        name: 'PopMarket OS',
        description: `Entry — ${eventTitle}`,
        email,
        customerName: guestName,
        onSuccess: async (response) => {
          const verify = await verifyRsvpPaymentAction(
            accessToken,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          if (verify.success) {
            toast.success('Entry fee paid! Your QR pass is ready.');
            if (onPaid) {
              onPaid();
            } else {
              window.location.reload();
            }
          } else {
            toast.error(verify.error ?? 'Payment verification failed');
          }
        },
      });

      if (!opened) toast.error('Could not open payment window');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button type="button" className="w-full" size="lg" onClick={() => void handlePay()} isLoading={isLoading}>
      <Ticket className="h-4 w-4" />
      Pay {formatCurrency(amount)} entry fee
    </Button>
  );
}
