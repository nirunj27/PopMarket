export const FOOD_CUISINES = [
  'American BBQ',
  'Mexican',
  'Indian Street Food',
  'Thai',
  'Japanese',
  'Italian',
  'Mediterranean',
  'Vegan / Plant-based',
  'Desserts & Sweets',
  'Coffee & Beverages',
  'Fusion',
  'Other',
] as const;

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Goa',
] as const;

export const STALL_ZONE_LABELS: Record<string, string> = {
  food_truck: 'Food Truck Bay',
  food_stall: 'Food Stall',
  blocked: 'Blocked',
  entrance: 'Entrance',
  stage: 'Stage / Entertainment',
};

export const STALL_ZONE_COLORS: Record<string, string> = {
  food_truck:
    'bg-[#c2410c] border-[#7c2d12] text-white shadow-md shadow-orange-950/30',
  food_stall:
    'bg-[#047857] border-[#064e3b] text-white shadow-md shadow-emerald-950/30',
  blocked:
    'bg-[#44403c] border-[#1c1917] text-stone-200 shadow-inner',
  entrance:
    'bg-[#ca8a04] border-[#854d0e] text-yellow-950 font-bold shadow-md shadow-amber-950/25',
  stage:
    'bg-[#7c3aed] border-[#4c1d95] text-white shadow-md shadow-violet-950/30',
};

export const STALL_GRID_CANVAS =
  'rounded-2xl border-2 border-stone-700/50 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 p-4 shadow-inner';

export const STALL_GRID_PLACEHOLDER =
  'rounded-xl border-2 border-dashed border-border bg-muted/25 p-4';

export const STALL_STATUS_OVERLAYS = {
  selected: 'ring-2 ring-white ring-offset-2 ring-offset-stone-900 scale-[1.03] z-10',
  locked:
    'bg-[#15803d] border-[#86efac] text-white shadow-[0_0_12px_rgba(34,197,94,0.45)]',
  assigned:
    'bg-[#0369a1] border-[#7dd3fc] text-white shadow-[0_0_8px_rgba(56,189,248,0.35)]',
  unavailable: 'opacity-40 cursor-not-allowed grayscale',
} as const;

export const APPLICATION_STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-warning/15 text-warning border-warning/30' },
  approved: { label: 'Approved', color: 'bg-success/15 text-success border-success/30' },
  waitlisted: {
    label: 'Waitlisted',
    color: 'bg-accent/20 text-accent-foreground border-accent/40',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-destructive/15 text-destructive border-destructive/30',
  },
} as const;

export const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-warning/15 text-warning' },
  paid: { label: 'Paid', color: 'bg-success/15 text-success' },
  waived: { label: 'Waived', color: 'bg-muted text-muted-foreground' },
  overdue: { label: 'Overdue', color: 'bg-destructive/15 text-destructive' },
} as const;

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/dashboard/events', label: 'Events', icon: 'Calendar' },
] as const;

export const MARKET_FEATURES = [
  {
    title: 'Vendor Applications',
    description: 'Share a link. Food trucks apply with cuisine type, truck specs, and power needs.',
    icon: 'Truck',
  },
  {
    title: 'Stall Map Editor',
    description: 'Drag-and-assign trucks to bays on an interactive grid floor plan.',
    icon: 'Map',
  },
  {
    title: 'Visitor RSVPs',
    description: 'Capacity limits, waitlists, and QR check-in for hungry crowds.',
    icon: 'Users',
  },
  {
    title: 'Payment Tracking',
    description: 'Track stall fees, deposits, and payment status per vendor.',
    icon: 'CreditCard',
  },
] as const;
