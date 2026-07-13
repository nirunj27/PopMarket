'use client';

import { useEffect, useState } from 'react';
import { PartyPopper, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicEventCelebrationProps {
  eventSlug: string;
  eventTitle: string;
  spotsRemaining: number;
  vendorCount: number;
}

const CONFETTI_COLORS = ['#e85d04', '#2d6a4f', '#f4a261', '#d97706', '#fef3e8'];

export function PublicEventCelebration({
  eventSlug,
  eventTitle,
  spotsRemaining,
  vendorCount,
}: PublicEventCelebrationProps) {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const key = `popmarket:event-welcome:${eventSlug}`;
    if (localStorage.getItem(key)) return;

    localStorage.setItem(key, '1');
    setShow(true);
    setConfetti(true);

    const confettiTimer = window.setTimeout(() => setConfetti(false), 5500);
    const bannerTimer = window.setTimeout(() => setShow(false), 11000);

    return () => {
      window.clearTimeout(confettiTimer);
      window.clearTimeout(bannerTimer);
    };
  }, [eventSlug]);

  if (!show && !confetti) return null;

  return (
    <>
      {confetti && (
        <div
          className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
          aria-hidden
        >
          {Array.from({ length: 72 }, (_, i) => {
            const left = (i * 17 + (i % 5) * 11) % 100;
            const delay = (i % 8) * 0.12;
            const duration = 2.8 + (i % 4) * 0.35;
            const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            const size = 6 + (i % 3) * 2;

            return (
              <span
                key={i}
                className="confetti-piece absolute top-0 block rounded-sm opacity-90"
                style={{
                  left: `${left}%`,
                  width: size,
                  height: size * 1.4,
                  backgroundColor: color,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {show && (
        <div
          className={cn(
            'fixed left-1/2 top-4 z-[61] w-[min(92vw,28rem)] -translate-x-1/2',
            'animate-slide-up rounded-2xl border border-primary/30 bg-card p-4 shadow-xl',
            'ring-2 ring-primary/10',
          )}
          role="status"
        >
          <button
            type="button"
            onClick={() => setShow(false)}
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss welcome message"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-sm font-bold leading-snug">
                Welcome — let&apos;s eat! 🎉
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{vendorCount} vendors</span> are
                lined up at <span className="font-medium text-foreground">{eventTitle}</span>.
                {spotsRemaining > 0 ? (
                  <>
                    {' '}
                    Only <span className="font-semibold text-primary">{spotsRemaining} spots</span>{' '}
                    left — reserve yours before the rush!
                  </>
                ) : (
                  ' Join the waitlist if spots open up.'
                )}
              </p>
              <p className="flex items-center gap-1 text-[11px] font-medium text-secondary">
                <Sparkles className="h-3 w-3" />
                Hurry up &amp; enjoy the feast
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
