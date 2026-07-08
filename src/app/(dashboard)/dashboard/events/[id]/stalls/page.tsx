import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { StallMap } from '@/components/features/stalls/stall-map';
import {
  getEventById,
  getStallsWithAssignments,
  getApprovedVendorsForEvent,
  getPaidVendorCountForEvent,
} from '@/lib/queries/events';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface StallsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StallsPage({ params }: StallsPageProps) {
  const { id } = await params;
  const [event, stalls, vendors, paidVendorCount] = await Promise.all([
    getEventById(id),
    getStallsWithAssignments(id),
    getApprovedVendorsForEvent(id),
    getPaidVendorCountForEvent(id),
  ]);

  if (!event) notFound();

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
        title="Stall map"
        description={`${event.stall_rows}×${event.stall_cols} floor plan · assign vendors to bays`}
      />

      <Card className="rounded-2xl border-border/80 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <StallMap
            eventId={id}
            stalls={stalls}
            approvedVendors={vendors}
            editable
            paidVendorCount={paidVendorCount}
            gridRows={event.stall_rows}
            gridCols={event.stall_cols}
            isDraft={event.status === 'draft'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
