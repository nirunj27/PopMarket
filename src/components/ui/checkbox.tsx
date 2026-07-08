import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          className={cn(
            'mt-1 h-4 w-4 shrink-0 rounded border-2 border-input accent-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
            className,
          )}
          {...props}
        />
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
