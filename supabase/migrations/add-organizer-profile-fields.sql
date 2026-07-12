-- Extra organizer profile fields for signup
-- Run in Supabase SQL Editor (safe to re-run)

alter table public.profiles
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists pincode text,
  add column if not exists whatsapp text,
  add column if not exists gstin text,
  add column if not exists website text,
  add column if not exists about text;
