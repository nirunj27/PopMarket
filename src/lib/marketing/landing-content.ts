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
    title: 'Vendor pipeline',
    description:
      'Share one apply link. Review cuisine, truck size, power needs, and approve in a clean table.',
    icon: Truck,
    accent: 'from-orange-500/20 to-primary/5',
  },
  {
    title: 'Live stall map',
    description:
      'Paint your floor plan, drop trucks into bays, lock paid vendors — no more spreadsheet chaos.',
    icon: Map,
    accent: 'from-emerald-500/20 to-secondary/5',
  },
  {
    title: 'Guest RSVPs',
    description:
      'Capacity caps, waitlists, optional tickets, and confirmation passes guests actually open.',
    icon: Users,
    accent: 'from-sky-500/20 to-accent/5',
  },
  {
    title: 'Honest commission',
    description:
      'Vendors and guests pay you. Settle PopMarket’s platform fee from Billing — clear, never hidden.',
    icon: CreditCard,
    accent: 'from-violet-500/20 to-primary/5',
  },
];

export const LANDING_STEPS: LandingStep[] = [
  {
    step: '01',
    title: 'Join as organizer',
    desc: 'Create your account, accept terms, and see the commission rate upfront.',
  },
  {
    step: '02',
    title: 'Launch the market',
    desc: 'Publish the event page, collect vendors, assign bays, take RSVPs.',
  },
  {
    step: '03',
    title: 'Collect your revenue',
    desc: 'Stall fees and tickets land with you via Razorpay — your customers, your cashflow.',
  },
  {
    step: '04',
    title: 'Settle with PopMarket',
    desc: 'Pay the platform % from Dashboard → Billing whenever commission is due.',
  },
];

export const LANDING_STATS = [
  { label: 'Built for', value: 'Market days' },
  { label: 'Vendor path', value: 'Apply → Pay → Pass' },
  { label: 'Commission', value: 'Transparent %' },
  { label: 'RSVP tickets', value: 'When you need them' },
] as const;

export const LANDING_NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/terms', label: 'Terms' },
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
    description:
      'Ideal for community markets — free guest RSVPs, paid vendor stalls, clear platform commission.',
    features: [
      '1 published event at a time',
      'Vendor apply links & review table',
      'Stall map editor (up to 15×15)',
      'Free visitor RSVP pages',
      'Razorpay vendor stall payments',
      'Platform commission on paid stall fees',
    ],
    cta: 'Start free',
    href: '/signup',
  },
  {
    id: 'paid',
    name: 'Paid RSVP',
    price: '',
    period: '',
    description:
      'Ticketed festivals — collect entry fees, export payout CSVs, settle commission from Billing.',
    features: [
      'Everything in Free RSVP',
      'RSVP entry fees via Razorpay',
      'Unlimited published events',
      'Stall map up to 30×30',
      'Payout CSV & Billing settlements',
      'Commission on stall fees + tickets',
    ],
    cta: 'Start collecting',
    href: '/signup?plan=paid',
    highlighted: true,
    badge: 'For ticketed markets',
  },
];
