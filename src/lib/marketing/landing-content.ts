import type { LucideIcon } from 'lucide-react';
import { CreditCard, Map, Truck, Users } from 'lucide-react';

export interface LandingFeature {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

export interface LandingStep {
  step: string;
  title: string;
  desc: string;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    title: 'Vendor applications',
    description: 'Public apply links with cuisine, truck specs, bay preferences, and power needs.',
    icon: Truck,
    accent: 'from-orange-500/20 to-primary/5',
  },
  {
    title: 'Stall map editor',
    description: 'Visual floor plan — assign bays, premium spots, and lock paid vendors.',
    icon: Map,
    accent: 'from-emerald-500/20 to-secondary/5',
  },
  {
    title: 'Visitor RSVPs',
    description: 'Capacity limits, waitlists, optional entry fees, and confirmation pages.',
    icon: Users,
    accent: 'from-sky-500/20 to-accent/5',
  },
  {
    title: 'Payments',
    description: 'Razorpay stall fees, revenue history, and vendor pass after payment.',
    icon: CreditCard,
    accent: 'from-violet-500/20 to-primary/5',
  },
];

export const LANDING_STEPS: LandingStep[] = [
  { step: '01', title: 'Create market', desc: 'Venue, grid layout, fees, RSVP settings.' },
  { step: '02', title: 'Collect vendors', desc: 'Share apply link — review in one table.' },
  { step: '03', title: 'Assign bays', desc: 'Drag-and-click stall map with live status.' },
  { step: '04', title: 'Go live', desc: 'Publish event page, RSVPs, and payments.' },
];

export const LANDING_STATS = [
  { label: 'Vendor workflow', value: 'Apply → Pay → Pass' },
  { label: 'Stall grid', value: 'Up to 30×30' },
  { label: 'Payments', value: 'Razorpay ready' },
  { label: 'RSVP fees', value: 'Optional entry' },
] as const;

export const LANDING_NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
] as const;

export interface LandingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
}

export const LANDING_PLANS: LandingPlan[] = [
  {
    id: 'free',
    name: 'Free RSVP',
    price: '₹0',
    period: 'forever',
    description: 'Run your market with free guest RSVPs — vendors pay stall fees via Razorpay.',
    features: [
      '1 published event at a time',
      'Vendor apply links & review table',
      'Stall map editor (up to 15×15)',
      'Free visitor RSVP pages',
      'Razorpay vendor stall payments',
    ],
    cta: 'Start',
    href: '/signup',
  },
  {
    id: 'paid',
    name: 'Paid RSVP',
    price: '',
    period: '',
    description: 'Collect entry fees from guests at RSVP — ideal for ticketed markets.',
    features: [
      'Everything in Free RSVP',
      'RSVP entry fees via Razorpay',
      'Unlimited published events',
      'Stall map up to 30×30 grid',
      'Payment history & refund tracking',
      'Premium bay pricing rules',
    ],
    cta: 'Start',
    href: '/signup?plan=paid',
    highlighted: true,
    badge: 'Collect entry fees',
  },
];
