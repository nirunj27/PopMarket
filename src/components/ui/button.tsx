'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes, type PointerEvent } from 'react';
import { buttonVariants } from '@/components/ui/button-variants';
import { useRipple } from '@/components/ui/use-ripple';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  /** Subtle click ripple — off for link variant */
  ripple?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      ripple = variant !== 'link' && variant !== 'ghost',
      children,
      disabled,
      onPointerDown,
      ...props
    },
    forwardedRef,
  ) => {
    const { ref: rippleRef, onPointerDown: spawnRipple } = useRipple<HTMLButtonElement>({
      disabled: disabled || isLoading || !ripple,
    });

    const setRef = (node: HTMLButtonElement | null) => {
      rippleRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
      spawnRipple(e);
      onPointerDown?.(e);
    };

    return (
      <ButtonPrimitive
        ref={setRef}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </ButtonPrimitive>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
