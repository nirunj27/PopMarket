-- Run in Supabase SQL Editor if vendor payment section is empty after approval

drop policy if exists "Public can view payments" on public.payments;
create policy "Public can view payments"
  on public.payments for select
  using (true);
