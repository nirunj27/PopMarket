'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  createCommissionPaymentOrderAction,
  verifyCommissionPaymentAction,
} from '@/lib/actions/commission';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/payments/load-razorpay';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

interface PayCommissionButtonProps {
  amount: number;
  organizerName: string;
  email: string;
}

export function PayCommissionButton({ amount, organizerName, email }: PayCommissionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    if (amount < 1) {
      toast.error('Nothing due');
      return;
    }

    setIsLoading(true);
    try {
      const orderResult = await createCommissionPaymentOrderAction();
      if (!orderResult.success || !orderResult.data) {
        toast.error(orderResult.error ?? 'Could not start payment');
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Refresh and try again.');
        return;
      }

      const { orderId, keyId, settlementId } = orderResult.data;
      const opened = openRazorpayCheckout({
        keyId,
        orderId,
        name: 'PopMarket OS',
        description: 'Platform commission settlement',
        email,
        customerName: organizerName,
        onSuccess: async (response) => {
          const verify = await verifyCommissionPaymentAction(
            settlementId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          if (verify.success) {
            toast.success('Commission paid — thank you!');
            router.refresh();
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
      size="lg"
      onClick={() => void handlePay()}
      isLoading={isLoading}
      disabled={amount < 1}
    >
      <CreditCard className="h-4 w-4" />
      Pay {formatCurrency(amount)} commission
    </Button>
  );
}
