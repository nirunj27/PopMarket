'use client';

import {
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  CtaSection,
} from '@/components/marketing/landing-sections';

/** Below-fold landing sections — lazy-loaded from the home page */
export function LandingBelowFold() {
  return (
    <>
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
    </>
  );
}
