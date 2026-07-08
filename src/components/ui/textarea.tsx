import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { RequiredLabel } from '@/components/ui/required-label';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <RequiredLabel htmlFor={textareaId} required={props.required}>
            {label}
          </RequiredLabel>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-24 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm transition-colors outline-none',
            'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error &&
              'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            className,
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${textareaId}-error`} className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
