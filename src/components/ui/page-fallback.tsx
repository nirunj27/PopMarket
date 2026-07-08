import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle, FileQuestion, Inbox, RefreshCw } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

type PageFallbackVariant = 'error' | 'notFound' | 'empty';

const variantConfig: Record<
  PageFallbackVariant,
  { icon: typeof AlertTriangle; defaultTitle: string; defaultDescription: string }
> = {
  error: {
    icon: AlertTriangle,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'We could not load this page. Please try again.',
  },
  notFound: {
    icon: FileQuestion,
    defaultTitle: 'Page not found',
    defaultDescription: 'The page you are looking for does not exist or may have moved.',
  },
  empty: {
    icon: Inbox,
    defaultTitle: 'Nothing here yet',
    defaultDescription: 'There is no content to show right now.',
  },
};

interface PageFallbackProps {
  variant?: PageFallbackVariant;
  title?: string;
  description?: string;
  children?: ReactNode;
  reset?: () => void;
  homeHref?: string;
  className?: string;
}

export function PageFallback({
  variant = 'error',
  title,
  description,
  children,
  reset,
  homeHref = '/',
  className,
}: PageFallbackProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex min-h-[min(420px,60vh)] flex-col items-center justify-center px-4 py-12 text-center',
        className,
      )}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="font-display text-xl font-bold text-foreground">
        {title ?? config.defaultTitle}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description ?? config.defaultDescription}
      </p>
      {children}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {reset && (
          <button type="button" onClick={reset} className={cn(buttonVariants())}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
        <Link href={homeHref} className={cn(buttonVariants({ variant: 'outline' }))}>
          Go home
        </Link>
      </div>
    </div>
  );
}
