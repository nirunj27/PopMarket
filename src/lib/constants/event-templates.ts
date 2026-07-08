import type { StallLayoutCell } from '@/lib/stall-layout';
import { buildDefaultStallLayout } from '@/lib/stall-layout';

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  values: {
    title?: string;
    description?: string;
    stallRows: number;
    stallCols: number;
    visitorCapacity: number;
    stallFee: number;
    setupTime: string;
    startTime: string;
    endTime: string;
  };
  getLayout: () => StallLayoutCell[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'small-market',
    name: 'Small Market',
    description: 'Neighborhood pop-up · ~24 bays',
    emoji: '🛖',
    values: {
      title: 'Neighborhood Food Truck Market',
      description: 'A cozy weekend market with local food trucks and live music.',
      stallRows: 4,
      stallCols: 6,
      visitorCapacity: 200,
      stallFee: 3000,
      setupTime: '09:00',
      startTime: '11:00',
      endTime: '16:00',
    },
    getLayout: () => buildDefaultStallLayout(4, 6),
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Large weekend festival · ~48 bays',
    emoji: '🎪',
    values: {
      title: 'City Food Truck Festival',
      description: 'A vibrant food festival with dozens of trucks, stages, and family activities.',
      stallRows: 6,
      stallCols: 8,
      visitorCapacity: 2000,
      stallFee: 8000,
      setupTime: '08:00',
      startTime: '12:00',
      endTime: '22:00',
    },
    getLayout: () => buildDefaultStallLayout(6, 8),
  },
  {
    id: 'corporate-lunch',
    name: 'Corporate Lunch',
    description: 'Office park lunch · ~15 bays',
    emoji: '🏢',
    values: {
      title: 'Corporate Lunch Market',
      description: 'Weekday lunch market for office parks — fast service, diverse cuisines.',
      stallRows: 3,
      stallCols: 5,
      visitorCapacity: 400,
      stallFee: 4500,
      setupTime: '10:00',
      startTime: '11:30',
      endTime: '14:30',
    },
    getLayout: () => buildDefaultStallLayout(3, 5),
  },
];
