'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogoutButton } from '@/components/layout/logout-button';
import { Badge } from '@/components/ui/badge';
import { parseOrganizerPlan } from '@/lib/plans';

interface UserInfo {
  name: string;
  email: string;
  initials: string;
  planLabel: string | null;
}

interface SidebarUserFooterProps {
  logoutRedirectTo?: string;
  /** Shown under the name — Organizer vs Platform admin */
  roleLabel?: string;
  /** Show Free / Paid RSVP plan badge (organizer dashboard) */
  showPlan?: boolean;
}

export function SidebarUserFooter({
  logoutRedirectTo = '/',
  roleLabel,
  showPlan = false,
}: SidebarUserFooterProps) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser || cancelled) return;

        const meta = authUser.user_metadata ?? {};
        const name =
          (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
          (typeof meta.name === 'string' && meta.name.trim()) ||
          authUser.email?.split('@')[0] ||
          roleLabel ||
          'User';
        const email = authUser.email ?? '';
        const initials = name
          .split(/\s+/)
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        const plan = showPlan ? parseOrganizerPlan(meta.plan) : null;
        const planLabel =
          plan === 'paid' ? 'Paid RSVP plan' : plan === 'free' ? 'Free RSVP plan' : null;

        setUser({ name, email, initials, planLabel });
      } catch {
        // Ignore — sidebar still shows logout
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [roleLabel, showPlan]);

  return (
    <div className="border-t border-border/60 p-4 space-y-3">
      {user && (
        <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
            aria-hidden
          >
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold leading-snug text-foreground break-words [overflow-wrap:anywhere]"
              title={user.name}
            >
              {user.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {roleLabel && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {roleLabel}
                </span>
              )}
              {user.planLabel && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                  {user.planLabel}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 break-all text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </p>
          </div>
        </div>
      )}
      <LogoutButton redirectTo={logoutRedirectTo} />
    </div>
  );
}
