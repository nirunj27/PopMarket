import { notFound } from 'next/navigation';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { PublishButton } from '@/components/features/events/publish-button';
import { DeleteEventButton } from '@/components/features/events/delete-event-button';
import { EventShareLinks } from '@/components/features/events/event-share-links';
import { getEventById, getStallsWithAssignments } from '@/lib/queries/events';
import { formatDate, formatCurrency, formatTime } from '@/lib/utils';
import { getAppUrl } from '@/lib/env';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import {
  Map,
  ClipboardList,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  Users,
  Grid3x3,
  IndianRupee,
  Zap,
  Star,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const stalls = await getStallsWithAssignments(event.id);
  const assignableStalls = stalls.filter(
    (s) => s.is_available && (s.zone === 'food_truck' || s.zone === 'food_stall'),
  );
  const premiumStalls = assignableStalls.filter((s) => s.is_premium);
  const isDraft = event.status === 'draft';

  const publicUrl = `${getAppUrl()}/e/${event.slug}`;
  const applyUrl = `${getAppUrl()}/apply/${event.slug}`;

  const navCards = [
    {
      href: `/dashboard/events/${id}/applications`,
      title: 'Applications',
      desc: 'Review food truck applications',
      icon: ClipboardList,
    },
    {
      href: `/dashboard/events/${id}/stalls`,
      title: 'Stall map',
      desc: 'Assign trucks to bays',
      icon: Map,
    },
    {
      href: `/dashboard/events/${id}/payments`,
      title: 'Payments',
      desc: 'Vendor fees & RSVP revenue',
      icon: IndianRupee,
    },
    {
      href: `/dashboard/events/${id}/terms`,
      title: 'Vendor terms',
      desc: 'Terms vendors must accept to apply',
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-10">
      {event.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.cover_image_url}
          alt=""
          className="h-48 w-full rounded-2xl object-cover sm:h-56"
        />
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader
          title={event.title}
          description={`${event.venue_name} · ${event.city}`}
        />
        <div className="flex flex-wrap gap-2">
          {isDraft && <PublishButton eventId={event.id} />}
          <Link
            href={`/e/${event.slug}`}
            target={isDraft ? undefined : '_blank'}
            rel={isDraft ? undefined : 'noopener noreferrer'}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <ExternalLink className="h-4 w-4" />
            {isDraft ? 'Preview public page' : 'Public page'}
          </Link>
          <Link
            href={`/apply/${event.slug}`}
            target={isDraft ? undefined : '_blank'}
            rel={isDraft ? undefined : 'noopener noreferrer'}
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <ExternalLink className="h-4 w-4" />
            {isDraft ? 'Preview vendor apply' : 'Vendor apply'}
          </Link>
          <DeleteEventButton eventId={event.id} eventTitle={event.title} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={event.status === 'published' ? 'success' : 'outline'}>{event.status}</Badge>
        <Badge variant="outline">
          {event.stall_rows}×{event.stall_cols} grid
        </Badge>
        <Badge variant="outline">{assignableStalls.length} vendor bays</Badge>
        {premiumStalls.length > 0 && (
          <Badge variant="warning">{premiumStalls.length} premium spots</Badge>
        )}
        <Badge variant="outline">{event.visitor_capacity.toLocaleString('en-IN')} visitor cap</Badge>
      </div>

      {isDraft && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Draft checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            {[
              'Review event details and cover image below',
              'Open stall map and confirm bay layout',
              'Click Publish when ready to accept vendors & RSVPs',
              'Share vendor apply link and public event page',
            ].map((step) => (
              <p key={step} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {step}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="card-elevated border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Event details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail icon={Calendar} label="Date" value={formatDate(event.event_date)} />
            <Detail
              icon={Clock}
              label="Market hours"
              value={`${formatTime(event.start_time)} – ${formatTime(event.end_time)}`}
            />
            {event.setup_time && (
              <Detail
                icon={Zap}
                label="Vendor setup"
                value={`From ${formatTime(event.setup_time)}`}
              />
            )}
            <Detail
              icon={Calendar}
              label="Created"
              value={formatDate(event.created_at)}
            />
            <Detail icon={MapPin} label="Venue" value={event.venue_name} sub={event.venue_address} />
            <Detail icon={Grid3x3} label="Stall layout" value={`${event.stall_rows}×${event.stall_cols} grid`} sub={`${assignableStalls.length} bays for vendors`} />
            <Detail icon={Users} label="Visitor capacity" value={`${event.visitor_capacity.toLocaleString('en-IN')} guests`} />
            <Detail icon={IndianRupee} label="Base stall fee" value={formatCurrency(Number(event.stall_fee))} />
            {premiumStalls.length > 0 && (
              <Detail
                icon={Star}
                label="Premium bays"
                value={`${premiumStalls.length} spots`}
                sub="Extra fee for high foot-traffic locations"
              />
            )}
            {event.description && (
              <div className="sm:col-span-2 rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed">{event.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-elevated border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Share links</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isDraft
                ? 'Open while signed in to preview. Guests and vendors only see these after you publish.'
                : 'Share with vendors and guests'}
            </p>
          </CardHeader>
          <CardContent>
            <EventShareLinks publicUrl={publicUrl} applyUrl={applyUrl} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {navCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block h-full">
              <Card className="card-elevated h-full border-border/60 transition-base hover-lift">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-muted/40 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
