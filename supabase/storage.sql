-- Event cover images storage (run in Supabase SQL Editor if bucket missing)
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload event covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can update own event covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view event covers"
  on storage.objects for select
  to public
  using (bucket_id = 'event-covers');

create policy "Authenticated users can delete own event covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
