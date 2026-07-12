import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  /** Show a non-clickable action with an explanation underneath */
  actionDisabled?: boolean;
  actionMessage?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionDisabled = false,
  actionMessage,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center',
        className,
      )}
      role="status"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action && (
        <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-2">
          {actionDisabled ? (
            <span
              className={cn(
                buttonVariants({ size: 'sm' }),
                'pointer-events-none opacity-50 shadow-none',
              )}
              aria-disabled="true"
            >
              {action.label}
            </span>
          ) : (
            <Link
              href={action.href}
              className={cn(buttonVariants({ size: 'sm' }), 'hover-lift')}
            >
              {action.label}
            </Link>
          )}
          {actionDisabled && actionMessage && (
            <p className="text-xs leading-relaxed text-warning" role="alert">
              {actionMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
