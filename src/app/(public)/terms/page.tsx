import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { SiteFooter } from '@/components/layout/site-footer';
import { OrganizerTermsDisplay } from '@/components/features/legal/organizer-terms-display';
import { getPublicPlatformFeePercent } from '@/lib/platform/admin';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Organizer terms',
  description:
    'PopMarket organizer terms — platform commission on vendor stall fees and RSVP entry fees.',
};

export default async function TermsPage() {
  const feePercent = await getPublicPlatformFeePercent();

  return (
    <>
      <main id="main-content" className="flex-1 bg-muted/20">
        <PageContainer className="max-w-3xl space-y-6 py-10">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold">Organizer terms & conditions</h1>
            <p className="text-muted-foreground">
              Superadmin runs the PopMarket platform. Organizers are our clients. Vendors and RSVP
              guests are your customers.
            </p>
          </div>

          <OrganizerTermsDisplay feePercent={feePercent} />

          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
              Create organizer account
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
              Back to home
            </Link>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
