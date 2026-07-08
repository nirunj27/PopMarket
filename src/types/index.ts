export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'approved' | 'waitlisted' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'waived' | 'overdue';
export type RsvpStatus = 'confirmed' | 'waitlisted' | 'cancelled';
export type StallZone = 'food_truck' | 'food_stall' | 'blocked' | 'entrance' | 'stage';
export type VendorType = 'food_truck' | 'food_stall';

export interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string | null;
  venue_name: string;
  venue_address: string;
  city: string;
  event_date: string;
  setup_time: string | null;
  start_time: string;
  end_time: string;
  stall_rows: number;
  stall_cols: number;
  visitor_capacity: number;
  stall_fee: number;
  rsvp_entry_fee: number;
  status: EventStatus;
  cover_image_url: string | null;
  vendor_terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorApplication {
  id: string;
  event_id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  cuisine_type: string;
  menu_description: string;
  menu_items?: unknown;
  truck_length_ft: number | null;
  truck_name: string | null;
  vendor_type: VendorType;
  preferred_stall_id: string | null;
  needs_power: boolean;
  needs_water: boolean;
  power_requirements: string | null;
  instagram_handle: string | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export interface Stall {
  id: string;
  event_id: string;
  stall_code: string;
  row_index: number;
  col_index: number;
  zone: StallZone;
  has_power: boolean;
  is_available: boolean;
  is_premium?: boolean;
  premium_fee?: number;
}

export interface StallAssignment {
  id: string;
  stall_id: string;
  application_id: string;
  assigned_at: string;
}

export interface VisitorRsvp {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  party_size: number;
  status: RsvpStatus;
  access_token: string;
  entry_fee_amount?: number;
  payment_status?: 'none' | 'pending' | 'paid' | 'waived';
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  event_id: string;
  application_id: string;
  amount: number;
  status: PaymentStatus;
  notes: string | null;
  paid_at: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
}

export interface EventWithStats extends Event {
  application_count: number;
  approved_count: number;
  rsvp_count: number;
  assigned_stalls: number;
}

export interface StallWithAssignment extends Stall {
  assignment?: StallAssignment & {
    application?: Pick<VendorApplication, 'id' | 'business_name' | 'cuisine_type' | 'status'> & {
      payment_status?: PaymentStatus | null;
    };
  };
}

export interface VendorApplicationWithDetails extends VendorApplication {
  payment?: Pick<Payment, 'amount' | 'status' | 'paid_at'> | null;
  assigned_stall_code?: string | null;
  preferred_stall_code?: string | null;
}

export interface EventPaymentRow {
  id: string;
  type: 'vendor' | 'rsvp';
  name: string;
  email: string;
  amount: number;
  status: string;
  paid_at: string | null;
  reference: string;
  created_at: string;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
