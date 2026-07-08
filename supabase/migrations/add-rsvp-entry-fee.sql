-- RSVP entry fee on events + payment tracking on RSVPs
alter table public.events
  add column if not exists rsvp_entry_fee numeric(10,2) not null default 0;

alter table public.visitor_rsvps
  add column if not exists entry_fee_amount numeric(10,2) not null default 0,
  add column if not exists payment_status text not null default 'none'
    check (payment_status in ('none', 'pending', 'paid', 'waived')),
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists paid_at timestamptz;
