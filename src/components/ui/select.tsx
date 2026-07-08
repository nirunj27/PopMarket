import { forwardRef, type SelectHTMLAttributes } from 'react';
import { RequiredLabel } from '@/components/ui/required-label';
import { cn } from '@/lib/utils';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <RequiredLabel htmlFor={selectId} required={props.required}>
            {label}
          </RequiredLabel>
        )}
        <select
          id={selectId}
          className={cn(
            'flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm transition-colors outline-none',
            'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive',
            className,
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';

export { Select };
