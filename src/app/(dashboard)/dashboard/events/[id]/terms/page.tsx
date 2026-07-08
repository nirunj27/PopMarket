import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { VendorTermsEditor } from '@/components/forms/vendor-terms-editor';
import { getEventById } from '@/lib/queries/events';
import { resolveVendorTerms } from '@/lib/vendor-terms';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, FileText } from 'lucide-react';

interface EventTermsPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventTermsPage({ params }: EventTermsPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  const terms = resolveVendorTerms(event.vendor_terms);

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
        title="Vendor terms & conditions"
        description={`Shown on the application form for ${event.title}. Vendors must accept before submitting.`}
      />

      <Card className="card-elevated border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Edit terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VendorTermsEditor eventId={event.id} initialTerms={terms} />
        </CardContent>
      </Card>
    </div>
  );
}
