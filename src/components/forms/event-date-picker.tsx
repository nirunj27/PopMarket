'use client';

import { useMemo, useState } from 'react';
import { format, parse, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import type { BookedEventDate } from '@/lib/queries/events';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { RequiredLabel } from '@/components/ui/required-label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EventDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  bookedDates?: BookedEventDate[];
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
}

function parseValue(value?: string): Date | undefined {
  if (!value) return undefined;
  try {
    return parse(value, 'yyyy-MM-dd', new Date());
  } catch {
    return undefined;
  }
}

export function EventDatePicker({
  value,
  onChange,
  bookedDates = [],
  error,
  label,
  hint,
  required,
}: EventDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseValue(value);
  const today = startOfDay(new Date());

  const bookedDateObjects = useMemo(
    () => bookedDates.map((b) => parse(b.date, 'yyyy-MM-dd', new Date())),
    [bookedDates],
  );

  return (
    <div className="space-y-1.5">
      {label && <RequiredLabel required={required}>{label}</RequiredLabel>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-12 w-full justify-between rounded-xl border-2 px-4 font-medium',
                !selected && 'text-muted-foreground',
                error && 'border-destructive',
              )}
            />
          }
        >
          <span className="flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 text-primary" />
            {selected ? format(selected, 'EEE, d MMM yyyy') : 'Pick event date'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) {
                  onChange(format(date, 'yyyy-MM-dd'));
                  setOpen(false);
                }
              }}
              disabled={[{ before: today }, ...bookedDateObjects]}
              modifiers={{ booked: bookedDateObjects }}
              modifiersClassNames={{
                booked: '[&_button]:bg-warning/15 [&_button]:text-warning [&_button]:line-through',
              }}
            />
          </div>

          {bookedDates.length > 0 && (
            <div className="border-t border-border p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your booked dates
              </p>
              <ul className="max-h-28 space-y-1.5 overflow-y-auto">
                {bookedDates.map((booked) => (
                  <li
                    key={booked.date}
                    className="rounded-lg bg-warning/10 px-2.5 py-1.5 text-xs"
                  >
                    <p className="font-semibold">
                      {format(parse(booked.date, 'yyyy-MM-dd', new Date()), 'd MMM yyyy')}
                    </p>
                    <p className="text-muted-foreground">
                      {booked.title} · {booked.venueName}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
