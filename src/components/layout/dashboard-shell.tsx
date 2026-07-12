'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Truck, Menu, X, Wallet, BookOpen } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarUserFooter } from '@/components/layout/sidebar-user-footer';

interface DashboardShellProps {
  children: ReactNode;
}

const items = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/billing', label: 'Billing', icon: Wallet },
  { href: '/dashboard/guide', label: 'Platform guide', icon: BookOpen },
] as const;

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel =
    items.find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href)),
    )?.label ?? 'Dashboard';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl transition-transform duration-250 ease-out lg:z-40 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Dashboard navigation"
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-base group-hover:scale-105">
              <Truck className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-display font-bold leading-tight">PopMarket</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Organizer
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Primary">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-base',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SidebarUserFooter logoutRedirectTo="/login" roleLabel="Organizer" showPlan />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/60 glass-panel px-4 lg:hidden">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card transition-base hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="dashboard-sidebar"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
          <span className="font-display text-sm font-bold">{activeLabel}</span>
          <div className="w-9" aria-hidden />
        </header>

        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
