import dynamic from 'next/dynamic';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { HeroSection, StatsStrip } from '@/components/marketing/landing-sections';
import { LandingBelowFoldSkeleton } from '@/components/marketing/landing-skeleton';

const LandingBelowFold = dynamic(
  () =>
    import('@/components/marketing/landing-below-fold').then((mod) => ({
      default: mod.LandingBelowFold,
    })),
  { loading: () => <LandingBelowFoldSkeleton /> },
);

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col market-pattern">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <StatsStrip />
        <LandingBelowFold />
      </main>
      <SiteFooter />
    </div>
  );
}
