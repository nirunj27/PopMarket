'use client';

import { Check, X } from 'lucide-react';
import { getPasswordStrength } from '@/lib/password-strength';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

const BAR_COLORS = [
  'bg-muted',
  'bg-destructive',
  'bg-warning',
  'bg-accent',
  'bg-success',
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, checks } = getPasswordStrength(password);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                level <= score ? BAR_COLORS[score] : 'bg-muted',
              )}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <ul className="space-y-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              'flex items-center gap-1.5 text-xs',
              check.met ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {check.met ? (
              <Check className="h-3 w-3 shrink-0" aria-hidden />
            ) : (
              <X className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
