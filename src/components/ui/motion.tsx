'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

interface RevealProps extends MotionProps {
  /** slide-up | fade | scale */
  variant?: 'slide-up' | 'fade' | 'scale';
}

export function Reveal({ children, className, delay = 0, variant = 'slide-up' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'motion-reveal',
        variant === 'fade' && 'motion-reveal-fade',
        variant === 'scale' && 'motion-reveal-scale',
        visible && 'motion-reveal-visible',
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** One-shot fade — for page sections, no scroll trigger */
export function FadeIn({ children, className, delay = 0 }: MotionProps) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div className={cn('animate-fade-in', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** One-shot slide up */
export function SlideIn({ children, className, delay = 0 }: MotionProps) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div className={cn('animate-slide-up', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** One-shot scale */
export function ScaleIn({ children, className, delay = 0 }: MotionProps) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div className={cn('animate-scale-in', className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
