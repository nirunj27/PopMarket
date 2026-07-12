-- Platform monetization + superadmin control
-- Run in Supabase SQL Editor after base schema

-- Role on profiles
alter table public.profiles
  add column if not exists role text not null default 'organizer'
  check (role in ('organizer', 'superadmin'));

-- Platform settings (single row)
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  platform_fee_percent numeric(5,2) not null default 10,
  available_cities text[] not null default array[
    'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Goa'
  ],
  platform_enabled boolean not null default true,
  razorpay_key_id text,
  razorpay_key_secret text,
  updated_at timestamptz default now() not null,
  updated_by uuid references public.profiles(id)
);

insert into public.platform_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

-- Only authenticated users can read settings (cities list needed by organizers)
drop policy if exists "Authenticated can read platform settings" on public.platform_settings;
create policy "Authenticated can read platform settings"
  on public.platform_settings for select
  to authenticated
  using (true);

-- Superadmins update via service role / server actions (no broad update policy)

-- Platform fee tracking on vendor payments
alter table public.payments
  add column if not exists platform_fee_amount numeric(10,2) not null default 0,
  add column if not exists organizer_net_amount numeric(10,2) not null default 0;

-- Platform fee on RSVP
alter table public.visitor_rsvps
  add column if not exists platform_fee_amount numeric(10,2) not null default 0,
  add column if not exists organizer_net_amount numeric(10,2) not null default 0;

-- Menu item images live in menu_items jsonb as { name, price, imageUrl? }

-- Promote a dedicated platform email to superadmin (adjust as needed)
-- Do NOT use your organizer client emails here — keep roles separate.
-- update public.profiles
-- set role = 'superadmin'
-- where id in (
--   select id from auth.users where email = 'platform@yourcompany.com'
-- );
