export interface GuideStep {
  step: string;
  title: string;
  description: string;
}

export interface GuideSection {
  title: string;
  body: string;
}

export interface PlatformGuideContent {
  role: 'organizer' | 'vendor';
  title: string;
  subtitle: string;
  steps: GuideStep[];
  sections: GuideSection[];
  tips: string[];
}

export const ORGANIZER_GUIDE: PlatformGuideContent = {
  role: 'organizer',
  title: 'Organizer platform guide',
  subtitle:
    'How to run a food truck market on PopMarket — from draft to payouts and commission settlement.',
  steps: [
    {
      step: '01',
      title: 'Create your event',
      description:
        'Go to Events → New event. Set venue, date, stall grid, stall fee, and visitor capacity. Keep it as a draft while you finish the layout.',
    },
    {
      step: '02',
      title: 'Design the stall map',
      description:
        'Open Stall map to paint bays, mark premium spots, and block non-vendor zones. Preview public and vendor links while signed in before you publish.',
    },
    {
      step: '03',
      title: 'Publish & share links',
      description:
        'Publish when ready. Share the vendor apply link with food trucks and the public page with guests for RSVPs (and tickets on Paid RSVP).',
    },
    {
      step: '04',
      title: 'Approve vendors & assign bays',
      description:
        'Review applications, approve the right trucks, then assign them on the stall map. Approved vendors get a payment link for the stall fee.',
    },
    {
      step: '05',
      title: 'Collect revenue & settle commission',
      description:
        'Stall fees and RSVP tickets are paid to you via Razorpay. PopMarket’s platform % appears under Billing — settle when commission is due.',
    },
  ],
  sections: [
    {
      title: 'Free vs Paid RSVP',
      body: 'Free RSVP: one published event, free guest RSVPs, paid vendor stalls. Paid RSVP: unlimited events, larger grids, and ticketed entry fees.',
    },
    {
      title: 'Who pays whom',
      body: 'Vendors and guests pay you. You keep the organizer share. Platform commission is settled separately from Dashboard → Billing — it is not deducted from Razorpay payouts automatically.',
    },
    {
      title: 'Draft vs published',
      body: 'Drafts are only visible to you for preview. Guests and vendors cannot use public or apply links until the event is published.',
    },
  ],
  tips: [
    'Set clear vendor terms before publishing — applicants must accept them.',
    'Export payout CSVs from Payments when you need accounting or bank reconciliations.',
    'Check Billing after market day so commission does not pile up unnoticed.',
  ],
};

export const VENDOR_GUIDE: PlatformGuideContent = {
  role: 'vendor',
  title: 'Vendor apply guide',
  subtitle:
    'What to expect when you apply for a stall — from form to approval, bay assignment, and payment.',
  steps: [
    {
      step: '01',
      title: 'Fill the application',
      description:
        'Enter business details, cuisine, menu, truck or stall size, power/water needs, and optionally pick a preferred bay. Accept the organizer’s vendor terms.',
    },
    {
      step: '02',
      title: 'Wait for review',
      description:
        'The organizer reviews your application. You receive a status link after submit — keep it to check progress.',
    },
    {
      step: '03',
      title: 'Get approved & assigned',
      description:
        'If approved, the organizer assigns you a bay on the market map. Preferred stalls are requests only — final placement is up to the organizer.',
    },
    {
      step: '04',
      title: 'Pay the stall fee',
      description:
        'Pay the stall fee (plus any premium bay fee) through the payment link. Payment goes to the event organizer, not PopMarket.',
    },
    {
      step: '05',
      title: 'Show up market day',
      description:
        'Arrive by the setup time on the event details. Bring what you listed (power adapters, water needs, etc.) and follow the venue rules in the terms.',
    },
  ],
  sections: [
    {
      title: 'Payments',
      body: 'Stall fees are collected by the organizer via Razorpay. PopMarket does not hold your stall money — questions about refunds or invoices go to the organizer.',
    },
    {
      title: 'Status link',
      body: 'After you apply you get a private vendor status link. Bookmark it — it shows approval state, bay assignment, and payment status.',
    },
    {
      title: 'Menus & photos',
      body: 'A clear menu and accurate truck size help organizers approve faster and place you in a bay that fits.',
    },
  ],
  tips: [
    'Double-check phone and WhatsApp — organizers often confirm details there.',
    'If a preferred bay is taken, you may still be approved for another open stall.',
    'Read the vendor terms fully; they cover setup windows, cancellations, and site rules.',
  ],
};

export function getGuideForRole(role: 'organizer' | 'vendor'): PlatformGuideContent {
  return role === 'vendor' ? VENDOR_GUIDE : ORGANIZER_GUIDE;
}
