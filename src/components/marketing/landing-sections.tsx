'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button-variants';
import { Card, CardContent } from '@/components/ui/card';
import { Reveal } from '@/components/ui/motion';
import { SectionHeading } from '@/components/ui/section-heading';
import { Display, Lead } from '@/components/ui/typography';
import {
  LANDING_FEATURES,
  LANDING_PLANS,
  LANDING_STATS,
  LANDING_STEPS,
} from '@/lib/marketing/landing-content';
import { cn } from '@/lib/utils';

function DashboardPreview() {
  return (
    <div className="glass-panel card-elevated overflow-hidden rounded-2xl p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Organizer dashboard
        </span>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Applications', val: '12', icon: Truck },
          { label: 'RSVPs', val: '248', icon: Users },
          { label: 'Paid vendors', val: '8', icon: CreditCard },
          { label: 'Next event', val: 'Sat', icon: Calendar },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border/60 bg-background/60 p-3 transition-base hover:bg-muted/50"
          >
            <item.icon className="mb-1 h-4 w-4 text-primary" />
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="font-display text-lg font-bold">{item.val}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 p-3">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-8 rounded-md border text-[8px] font-bold flex items-center justify-center text-white/90',
                i % 3 === 0 ? 'bg-[#c2410c] border-orange-900' : 'bg-[#047857] border-emerald-900',
              )}
            >
              {String.fromCharCode(65 + (i % 4))}
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 market-pattern">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
      <div className="content-container relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Built for food truck market organizers
            </div>
            <Display className="mt-4">
              Run markets with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                less chaos
              </span>
            </Display>
            <Lead className="mt-4 max-w-xl">
              Vendor applications, interactive stall maps, visitor RSVPs, and Razorpay payments — one
              OS for festival organizers in India.
            </Lead>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: 'lg' }), 'hover-lift shadow-lg w-full sm:w-auto')}
              >
                Start
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full sm:w-auto glass-panel',
                )}
              >
                See how it works
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {['Vendor links in seconds', 'Mobile-friendly'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} variant="scale">
            <DashboardPreview />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function StatsStrip() {
  return (
    <section className="border-b border-border/40 bg-muted/30 py-6">
      <div className="content-container mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
        {LANDING_STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 60} variant="fade">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-sm font-bold sm:text-base">{stat.value}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16">
      <div className="content-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl">
          <SectionHeading
            title="Everything for market day"
            description="From first application to the last taco — vendors, visitors, and revenue in one place."
          />
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 80} className="h-full">
                <Card className={cn('card-elevated hover-lift flex h-full border-border/60 bg-gradient-to-br', feature.accent)}>
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-base group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <h3 className="font-display text-base font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y border-border/40 bg-muted/25 py-12 sm:py-16">
      <div className="content-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl">
          <SectionHeading
            title="How it works"
            description="Four steps from idea to market day"
          />
        </Reveal>

        <ol className="mt-8 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 70} className="h-full">
              <li className="card-elevated hover-lift flex h-full min-h-[220px] flex-col rounded-2xl border border-border/60 bg-card p-5 text-center">
                <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground shadow-md">
                  {item.step}
                </div>
                <h3 className="mt-3 font-display font-bold">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 sm:py-16">
      <div className="content-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl">
          <SectionHeading
            title="Plans that scale with your markets"
            description="Pick a plan and start organizing — upgrade when you need more events and advanced tools. Razorpay fees apply only when you collect payments."
          />
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl items-stretch gap-6 sm:grid-cols-2">
          {LANDING_PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 80} className="h-full">
              <Card
                className={cn(
                  'card-elevated flex h-full flex-col border-border/60',
                  plan.highlighted && 'border-primary/40 ring-2 ring-primary/20',
                )}
              >
                <CardContent className="flex flex-1 flex-col p-6">
                  {plan.badge && (
                    <div className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      <Zap className="h-3.5 w-3.5" aria-hidden />
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  {plan.price ? (
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm font-medium text-primary">No monthly fee — pay per collection</p>
                  )}
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={cn(
                      buttonVariants({
                        variant: plan.highlighted ? 'default' : 'outline',
                        className: 'mt-6 w-full hover-lift',
                      }),
                    )}
                  >
                    {plan.cta}
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Free RSVP: 1 live event, 15×15 grid, free guest RSVPs. Paid RSVP: unlimited events,
          30×30 grid, collect entry fees via Razorpay.
        </p>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="content-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-secondary via-secondary to-emerald-800 text-secondary-foreground shadow-xl">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-14">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Ready for your next food truck festival?
              </h2>
              <p className="mt-3 max-w-lg text-secondary-foreground/85">
                Join organizers who run smoother markets with happier vendors and fuller lots.
              </p>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'mt-6 bg-primary text-primary-foreground hover:bg-primary/90 hover-lift shadow-lg',
                )}
              >
                Create your first event
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
