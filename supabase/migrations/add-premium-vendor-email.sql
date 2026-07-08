-- Run in Supabase SQL Editor after schema.sql

-- Premium stall spots (high foot-traffic bays)
alter table public.stalls
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_fee numeric(10,2) not null default 0;

-- Vendor application preferences
alter table public.vendor_applications
  add column if not exists vendor_type text not null default 'food_truck'
    check (vendor_type in ('food_truck', 'food_stall')),
  add column if not exists truck_name text,
  add column if not exists preferred_stall_id uuid references public.stalls(id) on delete set null;

-- Payment gateway fields (Razorpay)
alter table public.payments
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text;

create index if not exists idx_applications_preferred_stall
  on public.vendor_applications(preferred_stall_id);
