'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyableStatusLinkProps {
  path: string;
  title: string;
  description: string;
  className?: string;
  compact?: boolean;
}

export function CopyableStatusLink({
  path,
  title,
  description,
  className,
  compact = false,
}: CopyableStatusLinkProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = useMemo(() => {
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  }, [path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select the link and copy manually');
    }
  };

  return (
    <div className={cn(compact ? 'space-y-2.5 text-left' : 'space-y-4 text-left', className)}>
      <div className={compact ? 'text-left' : 'text-center'}>
        <h3 className={cn('font-display font-bold', compact ? 'text-base' : 'text-xl')}>
          {title}
        </h3>
        <p className={cn('text-muted-foreground', compact ? 'mt-1 text-xs' : 'mt-2 text-sm')}>
          {description}
        </p>
      </div>

      <div
        className={cn(
          'rounded-lg border border-primary/20 bg-background space-y-2',
          compact ? 'p-2.5' : 'rounded-xl border-2 p-4 space-y-3',
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your status page link
        </p>
        <p className="break-all font-mono text-xs font-medium text-foreground">{fullUrl}</p>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => void handleCopy()}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
          <Link
            href={path}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold sm:w-auto',
              'bg-primary text-primary-foreground shadow-md hover:bg-primary/90',
            )}
          >
            <ExternalLink className="h-4 w-4" />
            Open status page
          </Link>
        </div>
      </div>

      <p className="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
        Save this link — you&apos;ll need it to check status and complete payment.
      </p>
    </div>
  );
}
