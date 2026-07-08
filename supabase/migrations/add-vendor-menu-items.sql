-- Structured menu items (name + price) for vendor applications
alter table public.vendor_applications
  add column if not exists menu_items jsonb not null default '[]'::jsonb;

comment on column public.vendor_applications.menu_items is
  'Array of {name: string, price: number} menu items';
