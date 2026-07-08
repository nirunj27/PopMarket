import { cn } from '@/lib/utils';
import type { ElementType, ReactNode } from 'react';

type TypographyProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

/** Hero / marketing headlines — Plus Jakarta Sans */
export function Display<T extends ElementType = 'h1'>({
  as,
  className,
  children,
}: TypographyProps<T>) {
  const Tag = as ?? 'h1';
  return (
    <Tag
      className={cn(
        'font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Section titles */
export function Title<T extends ElementType = 'h2'>({
  as,
  className,
  children,
}: TypographyProps<T>) {
  const Tag = as ?? 'h2';
  return (
    <Tag
      className={cn(
        'font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Card / panel headings */
export function Heading<T extends ElementType = 'h3'>({
  as,
  className,
  children,
}: TypographyProps<T>) {
  const Tag = as ?? 'h3';
  return (
    <Tag className={cn('font-display text-lg font-bold tracking-tight sm:text-xl', className)}>
      {children}
    </Tag>
  );
}

/** Introductory paragraph under a headline */
export function Lead({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn('text-base leading-relaxed text-muted-foreground sm:text-lg', className)}>
      {children}
    </p>
  );
}

/** Secondary / helper copy */
export function Muted({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)}>{children}</p>;
}

/** Labels, meta, captions — 12px on 8px grid */
export function Caption({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn('text-xs font-medium leading-4 text-muted-foreground', className)}>
      {children}
    </span>
  );
}
