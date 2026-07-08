import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Heading, Lead } from '@/components/ui/typography';

interface PageHeroProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/** Consistent page intro banner — gradient, elevation, 8px-grid padding */
export function PageHero({ title, description, children, className }: PageHeroProps) {
  return (
    <header
      className={cn(
        'card-elevated rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/8 p-6 sm:p-8',
        className,
      )}
    >
      <Heading as="h1">{title}</Heading>
      {description && <Lead className="mt-2 max-w-2xl">{description}</Lead>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
