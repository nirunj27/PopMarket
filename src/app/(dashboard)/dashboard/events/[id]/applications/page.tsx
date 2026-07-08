import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ApplicationTable } from '@/components/features/applications/application-table';
import { getEventById, getApplicationsWithDetailsForEvent, getStallsWithAssignments } from '@/lib/queries/events';
import { getAppUrl } from '@/lib/env';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, Link2, Share2 } from 'lucide-react';

interface ApplicationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({ params }: ApplicationsPageProps) {
  const { id } = await params;
  const [event, applications, stalls] = await Promise.all([
    getEventById(id),
    getApplicationsWithDetailsForEvent(id),
    getStallsWithAssignments(id),
  ]);

  if (!event) notFound();

  const openBayCount = stalls.filter(
    (s) =>
      (s.zone === 'food_truck' || s.zone === 'food_stall') && s.is_available && !s.assignment,
  ).length;

  const applyUrl = `${getAppUrl()}/apply/${event.slug}`;

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/events/${id}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <PageHeader
        title="Vendor applications"
        description={`${applications.length} applications · ${event.title}`}
      />

      <Card className="rounded-2xl border-primary/20 bg-gradient-to-r from-primary/5 via-card to-accent/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Share2 className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">Share apply link</p>
              <p className="text-xs text-muted-foreground break-all">{applyUrl}</p>
            </div>
          </div>
          <a
            href={applyUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <Link2 className="h-4 w-4" />
            Open apply page
          </a>
        </CardContent>
      </Card>

      <ApplicationTable applications={applications} eventId={id} openBayCount={openBayCount} />
    </div>
  );
}
