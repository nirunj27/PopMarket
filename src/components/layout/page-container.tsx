import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Tighter vertical rhythm for dense dashboards */
  tight?: boolean;
  /** Narrower max width for forms (1152px) */
  wide?: boolean;
}

/** Max width 1280px (max-w-7xl), responsive padding on 8px grid */
export function PageContainer({ children, className, tight, wide }: PageContainerProps) {
  return (
    <div
      className={cn(
        'content-container mx-auto w-full px-4 sm:px-6 lg:px-8',
        wide ? 'max-w-6xl' : 'max-w-7xl',
        tight ? 'py-8 lg:py-10' : 'py-10 lg:py-12',
        className,
      )}
    >
      {children}
    </div>
  );
}
