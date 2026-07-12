import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { Lead, Title } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  /** Disable the header action and show a message underneath */
  actionDisabled?: boolean;
  actionMessage?: string;
}

export function PageHeader({
  title,
  description,
  action,
  actionDisabled = false,
  actionMessage,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Title as="h1" className="text-2xl sm:text-3xl">
          {title}
        </Title>
        {description && <Lead className="mt-1.5 text-sm sm:text-base">{description}</Lead>}
      </div>
      {action && (
        <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end sm:max-w-xs">
          {actionDisabled ? (
            <span
              className={cn(
                buttonVariants(),
                'pointer-events-none inline-flex opacity-50 shadow-none',
              )}
              aria-disabled="true"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {action.label}
            </span>
          ) : (
            <Link href={action.href} className={cn(buttonVariants(), 'hover-lift')}>
              <Plus className="h-4 w-4" aria-hidden />
              {action.label}
            </Link>
          )}
          {actionDisabled && actionMessage && (
            <p className="text-xs leading-relaxed text-warning sm:text-right" role="alert">
              {actionMessage}
            </p>
          )}
        </div>
      )}
    </header>
  );
}
