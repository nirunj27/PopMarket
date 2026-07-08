import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button-variants';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, MapPin, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicEventComingSoonProps {
  slug: string;
  title: string;
  description?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  city: string;
}

export function PublicEventComingSoon({
  slug,
  title,
  description,
  eventDate,
  startTime,
  endTime,
  venueName,
  city,
}: PublicEventComingSoonProps) {
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-secondary text-secondary-foreground">
        <div className="content-container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {description && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary-foreground/85">
              {description}
            </p>
          )}
          <dl className="mt-8 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden />
              <dd>{formatDate(eventDate)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" aria-hidden />
              <dd>
                {startTime?.slice(0, 5)} – {endTime?.slice(0, 5)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <dd>
                {venueName}, {city}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="content-container mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 space-y-6">
        <Card className="card-elevated border-primary/25 text-center">
          <CardContent className="space-y-4 p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Truck className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold">Vendors can apply now</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Share the apply link with food trucks. Visitor RSVPs and the full menu page open once
              vendors are approved with cuisine and menu details.
            </p>
            <Link
              href={`/apply/${slug}`}
              className={cn(buttonVariants({ size: 'lg' }), 'hover-lift w-full sm:w-auto')}
            >
              Apply for a stall
            </Link>
          </CardContent>
        </Card>

        <Card className="card-elevated border-border/60 text-center">
          <CardContent className="space-y-3 p-8">
            <h3 className="font-display text-lg font-bold">Visitor page coming soon</h3>
            <p className="text-sm text-muted-foreground">
              RSVP and food menus will appear here after the first vendor lineup is confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
