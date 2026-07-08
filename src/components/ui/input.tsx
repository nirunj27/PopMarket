import { Input as InputPrimitive } from '@base-ui/react/input';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { RequiredLabel } from '@/components/ui/required-label';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <RequiredLabel htmlFor={inputId} required={props.required}>
            {label}
          </RequiredLabel>
        )}
        <InputPrimitive
          type={type}
          id={inputId}
          className={cn(
            'h-11 w-full min-w-0 rounded-xl border-2 border-input bg-background px-4 py-2 text-sm transition-base outline-none',
            'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
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
Input.displayName = 'Input';

export { Input };
