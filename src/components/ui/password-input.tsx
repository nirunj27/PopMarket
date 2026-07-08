'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { RequiredLabel } from '@/components/ui/required-label';
import { cn } from '@/lib/utils';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  label?: string;
  hint?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <RequiredLabel htmlFor={inputId} required={props.required}>
            {label}
          </RequiredLabel>
        )}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id={inputId}
            className={cn(
              'flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 pr-11 text-sm transition-base',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
              className,
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
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
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
