'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  createVendorPaymentOrderAction,
  verifyVendorPaymentAction,
} from '@/lib/actions/events';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/payments/load-razorpay';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

interface VendorPaymentButtonProps {
  accessToken: string;
  amount: number;
  businessName: string;
  email: string;
}

export function VendorPaymentButton({
  accessToken,
  amount,
  businessName,
  email,
}: VendorPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const orderResult = await createVendorPaymentOrderAction(accessToken);
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
        description: `Stall fee — ${businessName}`,
        email,
        customerName: businessName,
        onSuccess: async (response) => {
          const verify = await verifyVendorPaymentAction(
            accessToken,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          if (verify.success) {
            toast.success('Payment successful! Your stall is secured.');
            window.location.reload();
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
    <Button
      type="button"
      className="w-full"
      size="lg"
      onClick={() => void handlePay()}
      isLoading={isLoading}
    >
      <CreditCard className="h-4 w-4" />
      Pay {formatCurrency(amount)} via Razorpay
    </Button>
  );
}
