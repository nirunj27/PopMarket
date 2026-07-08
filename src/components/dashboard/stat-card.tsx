import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, iconClassName, trend }: StatCardProps) {
  return (
    <Card className="card-elevated border-border/60 transition-base hover-lift">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            iconClassName ?? 'bg-primary/10 text-primary',
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
