export type OrganizerPlan = 'free' | 'paid';

export interface PlanLimits {
  id: OrganizerPlan;
  name: string;
  maxPublishedEvents: number | null;
  maxGridSize: number;
  rsvpEntryFees: boolean;
}

export const PLAN_LIMITS: Record<OrganizerPlan, PlanLimits> = {
  free: {
    id: 'free',
    name: 'Free',
    maxPublishedEvents: 1,
    maxGridSize: 15,
    rsvpEntryFees: false,
  },
  paid: {
    id: 'paid',
    name: 'Paid RSVP',
    maxPublishedEvents: null,
    maxGridSize: 30,
    rsvpEntryFees: true,
  },
};

/** Map legacy plan ids and unknown values to the two supported plans */
export function parseOrganizerPlan(value: unknown): OrganizerPlan {
  if (value === 'paid' || value === 'growth' || value === 'festival') return 'paid';
  return 'free';
}

export function getPlanLimits(plan: OrganizerPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function exceedsGridLimit(rows: number, cols: number, plan: OrganizerPlan): boolean {
  const { maxGridSize } = getPlanLimits(plan);
  return rows > maxGridSize || cols > maxGridSize;
}

export function gridLimitMessage(plan: OrganizerPlan): string {
  const { maxGridSize, name } = getPlanLimits(plan);
  return `${name} plan supports up to a ${maxGridSize}×${maxGridSize} stall grid. Upgrade to Paid RSVP for larger layouts.`;
}

export function publishedEventLimitMessage(plan: OrganizerPlan): string {
  const { maxPublishedEvents, name } = getPlanLimits(plan);
  if (maxPublishedEvents === null) return '';
  return `${name} plan allows ${maxPublishedEvents} published event at a time. Upgrade to Paid RSVP for unlimited markets.`;
}
