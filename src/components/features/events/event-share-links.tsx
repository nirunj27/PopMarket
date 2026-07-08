'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface EventShareLinksProps {
  publicUrl: string;
  applyUrl: string;
}

export function EventShareLinks({ publicUrl, applyUrl }: EventShareLinksProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const links = [
    { url: publicUrl, label: 'Public event page' },
    { url: applyUrl, label: 'Vendor application' },
  ];

  return (
    <div className="space-y-4">
      {links.map(({ url, label }) => (
        <div key={url}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            {label}
          </p>
          <p className="mb-2 break-all rounded-lg bg-muted p-2.5 font-mono text-xs">{url}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void copy(url, label)}>
            {copied === url ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === url ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      ))}
    </div>
  );
}
