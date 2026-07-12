import { buildOrganizerTerms, parseOrganizerTermsSections } from '@/lib/organizer-terms';
import { cn } from '@/lib/utils';
import { FileText, Percent } from 'lucide-react';

interface OrganizerTermsDisplayProps {
  feePercent: number;
  className?: string;
  compact?: boolean;
  title?: string;
}

export function OrganizerTermsDisplay({
  feePercent,
  className,
  compact,
  title = 'Organizer terms & conditions',
}: OrganizerTermsDisplayProps) {
  const sections = parseOrganizerTermsSections(buildOrganizerTerms(feePercent));

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/8 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Percent className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-[10px] text-muted-foreground">
            Platform commission {feePercent}% on stall &amp; RSVP fees
          </p>
        </div>
      </div>

      <div
        className={cn(
          'space-y-3 overflow-y-auto px-3 py-3',
          compact ? 'max-h-48' : 'max-h-72',
        )}
      >
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-lg border border-border/60 bg-background/80 px-3 py-2.5"
          >
            <h4 className="flex items-start gap-1.5 text-xs font-semibold text-primary">
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {section.title}
            </h4>
            {section.body && (
              <div className="mt-1.5 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {section.body.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith('- ')) {
                    return (
                      <p key={i} className="flex gap-1.5 pl-1">
                        <span className="text-primary">•</span>
                        <span>{trimmed.slice(2)}</span>
                      </p>
                    );
                  }
                  return <p key={i}>{trimmed}</p>;
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
