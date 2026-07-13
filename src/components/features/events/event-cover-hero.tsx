'use client';

import { useState } from 'react';
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventCoverHeroProps {
  src: string;
  alt?: string;
  className?: string;
}

export function EventCoverHero({ src, alt = '', className }: EventCoverHeroProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/20',
          'min-h-[200px] sm:min-h-[260px]',
          className,
        )}
        aria-hidden
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,93,4,0.12),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(45,106,79,0.1),transparent_50%)]" />
        <Truck className="relative h-14 w-14 text-primary/35 sm:h-16 sm:w-16" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden border-b border-border',
        'min-h-[200px] sm:min-h-[260px] md:min-h-[300px]',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="h-full w-full min-h-[inherit] object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-background/10 to-transparent"
        aria-hidden
      />
    </div>
  );
}
