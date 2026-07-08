-- PopMarket OS — Food Truck Market Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Events
create table if not exists public.events (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  venue_name text not null,
  venue_address text not null,
  city text not null,
  event_date date not null,
  setup_time time,
  start_time time not null,
  end_time time not null,
  stall_rows int not null default 6,
  stall_cols int not null default 8,
  visitor_capacity int not null default 500,
  stall_fee numeric(10,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'completed', 'cancelled')),
  cover_image_url text,
  vendor_terms text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.events enable row level security;

create policy "Organizers can manage own events"
  on public.events for all
  using (auth.uid() = organizer_id);

create policy "Public can view published events"
  on public.events for select
  using (status = 'published');

-- Vendor Applications
create table if not exists public.vendor_applications (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  business_name text not null,
  owner_name text not null,
  email text not null,
  phone text not null,
  cuisine_type text not null,
  menu_description text not null,
  menu_items jsonb not null default '[]'::jsonb,
  vendor_type text not null default 'food_truck' check (vendor_type in ('food_truck', 'food_stall')),
  truck_name text,
  truck_length_ft int,
  preferred_stall_id uuid references public.stalls(id) on delete set null,
  needs_power boolean default false,
  needs_water boolean default false,
  power_requirements text,
  instagram_handle text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'waitlisted', 'rejected')),
  rejection_reason text,
  access_token text unique not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.vendor_applications enable row level security;

create policy "Organizers can view applications for their events"
  on public.vendor_applications for select
  using (
    exists (
      select 1 from public.events
      where events.id = vendor_applications.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Organizers can update applications for their events"
  on public.vendor_applications for update
  using (
    exists (
      select 1 from public.events
      where events.id = vendor_applications.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Anyone can submit applications to published events"
  on public.vendor_applications for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = vendor_applications.event_id
      and events.status = 'published'
    )
  );

create policy "Public can view own application by token"
  on public.vendor_applications for select
  using (true);

-- Stalls
create table if not exists public.stalls (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  stall_code text not null,
  row_index int not null,
  col_index int not null,
  zone text not null default 'food_truck' check (zone in ('food_truck', 'food_stall', 'blocked', 'entrance', 'stage')),
  has_power boolean default true,
  is_available boolean default true,
  is_premium boolean not null default false,
  premium_fee numeric(10,2) not null default 0,
  unique(event_id, stall_code)
);

alter table public.stalls enable row level security;

create policy "Organizers can manage stalls"
  on public.stalls for all
  using (
    exists (
      select 1 from public.events
      where events.id = stalls.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Public can view stalls for published events"
  on public.stalls for select
  using (
    exists (
      select 1 from public.events
      where events.id = stalls.event_id
      and events.status = 'published'
    )
  );

-- Stall Assignments
create table if not exists public.stall_assignments (
  id uuid default uuid_generate_v4() primary key,
  stall_id uuid references public.stalls(id) on delete cascade not null unique,
  application_id uuid references public.vendor_applications(id) on delete cascade not null unique,
  assigned_at timestamptz default now() not null
);

alter table public.stall_assignments enable row level security;

create policy "Organizers can manage assignments"
  on public.stall_assignments for all
  using (
    exists (
      select 1 from public.stalls
      join public.events on events.id = stalls.event_id
      where stalls.id = stall_assignments.stall_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Public can view assignments for published events"
  on public.stall_assignments for select
  using (
    exists (
      select 1 from public.stalls
      join public.events on events.id = stalls.event_id
      where stalls.id = stall_assignments.stall_id
      and events.status = 'published'
    )
  );

-- Visitor RSVPs
create table if not exists public.visitor_rsvps (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text,
  party_size int not null default 1,
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlisted', 'cancelled')),
  access_token text unique not null,
  created_at timestamptz default now() not null
);

alter table public.visitor_rsvps enable row level security;

create policy "Anyone can RSVP to published events"
  on public.visitor_rsvps for insert
  with check (
    exists (
      select 1 from public.events
      where events.id = visitor_rsvps.event_id
      and events.status = 'published'
    )
  );

create policy "Organizers can view RSVPs"
  on public.visitor_rsvps for select
  using (
    exists (
      select 1 from public.events
      where events.id = visitor_rsvps.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Public can view own RSVP"
  on public.visitor_rsvps for select
  using (true);

-- Payments
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  application_id uuid references public.vendor_applications(id) on delete cascade not null unique,
  amount numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'waived', 'overdue')),
  notes text,
  paid_at timestamptz,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now() not null
);

alter table public.payments enable row level security;

create policy "Organizers can manage payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.events
      where events.id = payments.event_id
      and events.organizer_id = auth.uid()
    )
  );

create policy "Public can view payments"
  on public.payments for select
  using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index if not exists idx_events_organizer on public.events(organizer_id);
create index if not exists idx_events_slug on public.events(slug);
create index if not exists idx_applications_event on public.vendor_applications(event_id);
create index if not exists idx_applications_token on public.vendor_applications(access_token);
create index if not exists idx_stalls_event on public.stalls(event_id);
create index if not exists idx_rsvps_event on public.visitor_rsvps(event_id);
