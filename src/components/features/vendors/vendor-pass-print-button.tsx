'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function VendorPassPrintButton() {
  const handlePrint = () => {
    document.body.classList.add('printing-vendor-pass');
    window.print();
    window.setTimeout(() => document.body.classList.remove('printing-vendor-pass'), 500);
  };

  return (
    <Button type="button" variant="outline" className="no-print" onClick={handlePrint}>
      <Printer className="h-4 w-4" />
      Print vendor pass
    </Button>
  );
}
