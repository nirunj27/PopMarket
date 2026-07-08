import Link from 'next/link';
import { Truck } from 'lucide-react';
import { LANDING_NAV } from '@/lib/marketing/landing-content';

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass-panel">
      <div className="content-container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
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
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Auth shortcuts">
            {LANDING_NAV.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-base hover:bg-muted/80 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
