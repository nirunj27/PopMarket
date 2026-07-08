import type { StallLayoutCell } from '@/lib/stall-layout';

export interface FeeScenario {
  id: string;
  label: string;
  occupancy: number;
  amount: number;
  stallsSold: number;
}

export interface FeeBreakdown {
  foodTruckBays: number;
  foodStallBays: number;
  assignableStalls: number;
  totalBays: number;
  infrastructureBays: number;
  blockedBays: number;
  feePerStall: number;
  maxRevenue: number;
  occupancyRate: number;
  scenarios: FeeScenario[];
  truckRevenue: number;
  stallRevenue: number;
}

export function calculateFeeBreakdown(
  layout: StallLayoutCell[],
  stallFee: number,
): FeeBreakdown {
  const foodTruckBays = layout.filter((c) => c.zone === 'food_truck').length;
  const foodStallBays = layout.filter((c) => c.zone === 'food_stall').length;
  const assignableStalls = foodTruckBays + foodStallBays;
  const totalBays = layout.length;
  const infrastructureBays = layout.filter(
    (c) => c.zone === 'entrance' || c.zone === 'stage',
  ).length;
  const blockedBays = layout.filter((c) => c.zone === 'blocked').length;
  const fee = Number.isFinite(stallFee) && stallFee > 0 ? stallFee : 0;
  const maxRevenue = assignableStalls * fee;
  const truckRevenue = foodTruckBays * fee;
  const stallRevenue = foodStallBays * fee;

  const scenarioDefs = [
    { id: 'full', label: 'Full sell-out', occupancy: 1 },
    { id: 'strong', label: 'Strong demand', occupancy: 0.85 },
    { id: 'moderate', label: 'Moderate fill', occupancy: 0.6 },
    { id: 'conservative', label: 'Conservative', occupancy: 0.4 },
  ];

  const scenarios: FeeScenario[] = scenarioDefs.map((s) => {
    const stallsSold = Math.round(assignableStalls * s.occupancy);
    return {
      id: s.id,
      label: s.label,
      occupancy: s.occupancy,
      stallsSold,
      amount: stallsSold * fee,
    };
  });

  return {
    foodTruckBays,
    foodStallBays,
    assignableStalls,
    totalBays,
    infrastructureBays,
    blockedBays,
    feePerStall: fee,
    maxRevenue,
    occupancyRate: totalBays > 0 ? assignableStalls / totalBays : 0,
    scenarios,
    truckRevenue,
    stallRevenue,
  };
}
