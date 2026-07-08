-- Per-event vendor terms & conditions shown on the application form
alter table public.events
  add column if not exists vendor_terms text;
