'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Truck, Menu, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { LANDING_NAV } from '@/lib/marketing/landing-content';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  variant?: 'full' | 'minimal';
}

const navLinks = LANDING_NAV;

export function SiteHeader({ variant = 'full' }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass-panel">
      <div
        className={cn(
          'content-container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8',
          variant === 'minimal' && 'justify-center sm:justify-between',
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-base group-hover:scale-105">
            <Truck className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-tight tracking-tight">
              PopMarket
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Food Truck OS
            </span>
          </div>
        </Link>

        {variant === 'full' && (
          <>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-base hover:bg-muted/80 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }), 'hover-lift shadow-md')}>
                Get started
              </Link>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-base"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </>
        )}
      </div>

      {variant === 'full' && mobileOpen && (
        <nav
          className="border-t border-border/50 glass-panel px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/50 pt-3">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: 'sm' }), 'w-full')}
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
