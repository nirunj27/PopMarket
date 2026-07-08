import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RequiredLabelProps {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

/** Label with required asterisk tight against text */
export function RequiredLabel({ htmlFor, children, required, className }: RequiredLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn('inline-flex w-auto gap-0', className)}>
      <span className="inline-flex items-baseline">
        {children}
        {required && (
          <span className="text-destructive leading-none" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </Label>
  );
}
