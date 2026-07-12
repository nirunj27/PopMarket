'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Calendar, Users, Shield, Menu, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarUserFooter } from '@/components/layout/sidebar-user-footer';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/events', label: 'All events', icon: Calendar },
  { href: '/admin/organizers', label: 'Organizers', icon: Users },
  { href: '/admin/settings', label: 'Platform settings', icon: Settings },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl transition-transform duration-250 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display font-bold leading-tight">PopMarket</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Superadmin
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary/15 text-secondary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <SidebarUserFooter logoutRedirectTo="/admin/login" roleLabel="Platform admin" />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border/60 bg-background/80 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="ml-3 font-display text-sm font-bold">Admin</span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </>
  );
}
