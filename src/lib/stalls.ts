import type { StallWithAssignment } from '@/types';

export function isVendorPaymentComplete(status: string | null | undefined): boolean {
  return status === 'paid' || status === 'waived';
}

export function isStallPaymentLocked(stall: StallWithAssignment): boolean {
  return (
    !!stall.assignment?.application &&
    isVendorPaymentComplete(stall.assignment.application.payment_status)
  );
}
