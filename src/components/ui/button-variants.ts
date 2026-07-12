import { cva } from 'class-variance-authority';

/** Server-safe button styles — use with Link in RSC; use Button component for clicks */
export const buttonVariants = cva(
  'group/button relative overflow-hidden inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-250 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:-translate-y-px hover:shadow-lg',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:-translate-y-px',
        outline:
          'border-2 border-border bg-background hover:bg-muted hover:border-primary/30 text-foreground hover:-translate-y-px',
        ghost: 'hover:bg-muted text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-px',
        accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:-translate-y-px',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
