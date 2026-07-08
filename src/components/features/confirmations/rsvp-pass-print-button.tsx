'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function RsvpPassPrintButton() {
  const handlePrint = () => {
    document.body.classList.add('printing-rsvp-pass');
    window.print();
    window.setTimeout(() => document.body.classList.remove('printing-rsvp-pass'), 500);
  };

  return (
    <Button type="button" variant="outline" className="no-print" onClick={handlePrint}>
      <Printer className="h-4 w-4" />
      Print entry pass
    </Button>
  );
}
