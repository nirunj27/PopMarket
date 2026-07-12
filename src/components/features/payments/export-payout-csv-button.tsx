'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { EventPaymentRow } from '@/types';
import { downloadCsv, rowsToCsv } from '@/lib/csv';
import { Button } from '@/components/ui/button';

interface ExportPayoutCsvButtonProps {
  payments: EventPaymentRow[];
  eventTitle: string;
  eventId: string;
}

const HEADERS = [
  'type',
  'name',
  'email',
  'gross_amount',
  'platform_fee',
  'organizer_net',
  'status',
  'paid_at',
  'razorpay_payment_id',
  'razorpay_order_id',
  'created_at',
] as const;

export function ExportPayoutCsvButton({
  payments,
  eventTitle,
  eventId,
}: ExportPayoutCsvButtonProps) {
  const handleExport = () => {
    if (payments.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const rows = payments.map((p) => [
      p.type,
      p.name,
      p.email,
      p.amount.toFixed(2),
      p.platform_fee_amount.toFixed(2),
      p.organizer_net_amount.toFixed(2),
      p.status,
      p.paid_at ?? '',
      p.razorpay_payment_id ?? '',
      p.razorpay_order_id ?? '',
      p.created_at,
    ]);

    const csv = rowsToCsv([...HEADERS], rows);
    const safeTitle = eventTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`payout-${safeTitle || eventId.slice(0, 8)}-${date}.csv`, csv);
    toast.success(`Exported ${payments.length} rows for accounting`);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Export payout CSV
    </Button>
  );
}
