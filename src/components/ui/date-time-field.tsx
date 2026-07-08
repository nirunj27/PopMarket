'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { RequiredLabel } from '@/components/ui/required-label';
import { cn } from '@/lib/utils';

export interface DateTimeFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  kind: 'date' | 'time';
}

const DateTimeField = forwardRef<HTMLInputElement, DateTimeFieldProps>(
  ({ className, error, label, hint, kind, id, ...props }, ref) => {
    const inputId = id || props.name;
    const Icon = kind === 'date' ? Calendar : Clock;

    return (
      <div className="space-y-1.5">
        {label && (
          <RequiredLabel htmlFor={inputId} required={props.required}>
            {label}
          </RequiredLabel>
        )}
        <div className="relative">
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <input
            type={kind}
            id={inputId}
            className={cn(
              'flex h-12 w-full rounded-xl border-2 border-input bg-gradient-to-br from-background to-muted/30 px-4 py-2 pl-11 text-sm font-medium transition-all',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-sm',
              'disabled:cursor-not-allowed disabled:opacity-50',
              '[color-scheme:light]',
              kind === 'date' && 'tracking-wide',
              error &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
              className,
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
DateTimeField.displayName = 'DateTimeField';

export { DateTimeField };
