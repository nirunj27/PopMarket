'use client';

import type { EventTemplate } from '@/lib/constants/event-templates';
import { EVENT_TEMPLATES } from '@/lib/constants/event-templates';
import { cn } from '@/lib/utils';

interface EventTemplatePickerProps {
  activeId?: string;
  onSelect: (template: EventTemplate) => void;
}

export function EventTemplatePicker({ activeId, onSelect }: EventTemplatePickerProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-sm font-bold">Quick start templates</h3>
        <p className="text-xs text-muted-foreground">
          Pre-fill layout, capacity, and schedule — customize after applying
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {EVENT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-all hover:border-primary/40 hover:shadow-md',
              activeId === template.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card',
            )}
          >
            <span className="text-2xl" aria-hidden>
              {template.emoji}
            </span>
            <p className="mt-2 font-semibold text-sm">{template.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
