import { CheckCircle2, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlatformGuideContent } from '@/lib/guides/platform-guides';
import { cn } from '@/lib/utils';

interface PlatformGuideProps {
  guide: PlatformGuideContent;
  /** Compact layout for sidebars (vendor apply) */
  compact?: boolean;
  className?: string;
}

export function PlatformGuide({ guide, compact = false, className }: PlatformGuideProps) {
  return (
    <div className={cn('space-y-6', compact && 'space-y-4', className)}>
      <header className={cn(!compact && 'max-w-2xl')}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
          {guide.role === 'organizer' ? 'Organizer' : 'Vendor'} · Platform guide
        </p>
        <h2
          className={cn(
            'mt-1 font-display font-bold tracking-tight text-foreground',
            compact ? 'text-lg' : 'text-2xl sm:text-3xl',
          )}
        >
          {guide.title}
        </h2>
        <p
          className={cn(
            'mt-2 text-muted-foreground',
            compact ? 'text-xs leading-relaxed' : 'text-sm sm:text-base',
          )}
        >
          {guide.subtitle}
        </p>
      </header>

      <ol className={cn('grid gap-3', !compact && 'sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2')}>
        {guide.steps.map((item) => (
          <li
            key={item.step}
            className={cn(
              'rounded-2xl border border-border/60 bg-card p-4',
              compact && 'rounded-xl p-3',
            )}
          >
            <span className="font-display text-xs font-bold text-primary">{item.step}</span>
            <h3 className={cn('mt-1 font-display font-bold', compact ? 'text-sm' : 'text-base')}>
              {item.title}
            </h3>
            <p
              className={cn(
                'mt-1 text-muted-foreground leading-relaxed',
                compact ? 'text-[11px]' : 'text-sm',
              )}
            >
              {item.description}
            </p>
          </li>
        ))}
      </ol>

      <div className={cn('grid gap-3', !compact && 'sm:grid-cols-3')}>
        {guide.sections.map((section) => (
          <Card key={section.title} className="border-border/60">
            <CardHeader className={cn(compact ? 'p-3 pb-1' : 'pb-2')}>
              <CardTitle className={cn(compact ? 'text-sm' : 'text-base')}>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className={cn(compact ? 'p-3 pt-0' : undefined)}>
              <p
                className={cn(
                  'leading-relaxed text-muted-foreground',
                  compact ? 'text-[11px]' : 'text-sm',
                )}
              >
                {section.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className={cn('flex flex-row items-center gap-2', compact ? 'p-3 pb-1' : 'pb-2')}>
          <Lightbulb className="h-4 w-4 text-primary" aria-hidden />
          <CardTitle className={cn(compact ? 'text-sm' : 'text-base')}>Tips</CardTitle>
        </CardHeader>
        <CardContent className={cn(compact ? 'p-3 pt-0' : undefined)}>
          <ul className="space-y-2">
            {guide.tips.map((tip) => (
              <li
                key={tip}
                className={cn(
                  'flex items-start gap-2 text-muted-foreground',
                  compact ? 'text-[11px]' : 'text-sm',
                )}
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
