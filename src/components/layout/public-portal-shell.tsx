import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PublicPortalShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  asideWidth?: 'sm' | 'md' | 'lg';
  /** Sidebar column — default left; use right for RSVP on public event pages */
  asidePosition?: 'left' | 'right';
}

/** Dense, scrollable light layout for public vendor/RSVP flows */
export function PublicPortalShell({
  eyebrow,
  title,
  subtitle,
  aside,
  children,
  className,
  asideWidth = 'md',
  asidePosition = 'left',
}: PublicPortalShellProps) {
  return (
    <div className={cn('public-portal-sheet mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4', className)}>
      <header className="mb-3 border-b border-border pb-2.5">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <h1 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>}
      </header>

      {aside ? (
        <div
          className={cn(
            'grid items-start gap-3',
            asidePosition === 'right'
              ? asideWidth === 'sm'
                ? 'lg:grid-cols-[minmax(0,1fr)_220px]'
                : asideWidth === 'lg'
                  ? 'lg:grid-cols-[minmax(0,1fr)_300px]'
                  : 'lg:grid-cols-[minmax(0,1fr)_260px]'
              : asideWidth === 'sm'
                ? 'lg:grid-cols-[220px_minmax(0,1fr)]'
                : asideWidth === 'lg'
                  ? 'lg:grid-cols-[300px_minmax(0,1fr)]'
                  : 'lg:grid-cols-[260px_minmax(0,1fr)]',
          )}
        >
          <aside
            className={cn(
              'lg:sticky lg:top-16 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto',
              asidePosition === 'right' ? 'order-2 lg:order-2' : 'order-2 lg:order-1',
            )}
          >
            {aside}
          </aside>
          <div
            className={cn(
              'min-w-0 space-y-2',
              asidePosition === 'right' ? 'order-1 lg:order-1' : 'order-1 lg:order-2',
            )}
          >
            {children}
          </div>
        </div>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

export function PortalPanel({
  title,
  children,
  className,
  noPadding,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section className={cn('portal-panel overflow-hidden rounded-lg border border-border bg-card', className)}>
      {title && (
        <h2 className="border-b border-border bg-muted/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      )}
      <div className={noPadding ? undefined : 'p-3'}>{children}</div>
    </section>
  );
}

export function PortalStatStrip({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-xs">
      {children}
    </div>
  );
}

export function PortalStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5 pr-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={cn('font-semibold', highlight && 'text-primary')}>{value}</span>
    </div>
  );
}
