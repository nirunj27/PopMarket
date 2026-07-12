import Link from 'next/link';
import { Truck } from 'lucide-react';
import { LANDING_NAV } from '@/lib/marketing/landing-content';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="content-container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md"
                aria-hidden
              >
                <Truck className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">PopMarket OS</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              We run the platform. Organizers run the markets. Vendors and guests are their
              customers — with clear commission and Billing settlements.
            </p>
          </div>

          <nav aria-label="Product">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product
            </h2>
            <ul className="mt-3 space-y-2">
              {LANDING_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-base hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Account
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-foreground/80 transition-base hover:text-primary"
                >
                  Organizer login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-foreground/80 transition-base hover:text-primary"
                >
                  Sign up free
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-foreground/80 transition-base hover:text-primary"
                >
                  Organizer terms
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-foreground/80 transition-base hover:text-primary"
                >
                  Platform admin
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} PopMarket OS</p>
          <p>Built with Next.js & Supabase</p>
        </div>
      </div>
    </footer>
  );
}
