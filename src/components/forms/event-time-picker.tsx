'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { RequiredLabel } from '@/components/ui/required-label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-primitive';
import { cn } from '@/lib/utils';

interface EventTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  hint?: string;
  required?: boolean;
  minTime?: string;
  maxTime?: string;
}

function formatDisplay(time?: string) {
  if (!time) return 'Select time';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function buildTimeOptions(minTime?: string, maxTime?: string) {
  const options: { value: string; label: string }[] = [];
  const minMinutes = minTime ? toMinutes(minTime) : 0;
  const maxMinutes = maxTime ? toMinutes(maxTime) : 23 * 60 + 45;

  for (let mins = 0; mins < 24 * 60; mins += 15) {
    if (mins < minMinutes || mins > maxMinutes) continue;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    options.push({ value, label: formatDisplay(value) });
  }

  return options;
}

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function EventTimePicker({
  value,
  onChange,
  error,
  label,
  hint,
  required,
  minTime,
  maxTime,
}: EventTimePickerProps) {
  const options = useMemo(() => buildTimeOptions(minTime, maxTime), [minTime, maxTime]);

  return (
    <div className="space-y-1.5">
      {label && <RequiredLabel required={required}>{label}</RequiredLabel>}

      <Select value={value ?? null} onValueChange={(v) => onChange(v as string)}>
        <SelectTrigger
          className={cn(
            'h-12 w-full rounded-xl border-2 px-4 font-medium',
            !value && 'text-muted-foreground',
            error && 'border-destructive',
          )}
        >
          <span className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-primary" />
            <SelectValue placeholder="Select time">
              {value ? formatDisplay(value) : 'Select time'}
            </SelectValue>
          </span>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
