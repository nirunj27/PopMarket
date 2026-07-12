-- Commission settlement: organizers pay platform fees to PopMarket
-- Run in Supabase SQL Editor after add-platform-admin.sql

-- Track whether organizer has settled platform fee for each paid row
alter table public.payments
  add column if not exists commission_settled_at timestamptz,
  add column if not exists commission_settlement_id uuid;

alter table public.visitor_rsvps
  add column if not exists commission_settled_at timestamptz,
  add column if not exists commission_settlement_id uuid;

-- Organizer acceptance of platform T&Cs
alter table public.profiles
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_terms_version text;

-- Settlements (organizer → platform commission payments)
create table if not exists public.commission_settlements (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commission_settlements_organizer_idx
  on public.commission_settlements (organizer_id, created_at desc);

alter table public.commission_settlements enable row level security;

drop policy if exists "Organizers read own settlements" on public.commission_settlements;
create policy "Organizers read own settlements"
  on public.commission_settlements for select
  to authenticated
  using (organizer_id = auth.uid());

-- Link paid rows back to settlement (FK after table exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payments_commission_settlement_fk'
  ) then
    alter table public.payments
      add constraint payments_commission_settlement_fk
      foreign key (commission_settlement_id)
      references public.commission_settlements(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'rsvps_commission_settlement_fk'
  ) then
    alter table public.visitor_rsvps
      add constraint rsvps_commission_settlement_fk
      foreign key (commission_settlement_id)
      references public.commission_settlements(id)
      on delete set null;
  end if;
end $$;
