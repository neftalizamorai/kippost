-- Storage bucket for post cover images
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder
create policy "Users can upload covers"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update/replace their own covers
create policy "Users can update covers"
on storage.objects for update
to authenticated
using (
  bucket_id = 'covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own covers
create policy "Users can delete covers"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'covers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Covers are publicly readable
create policy "Covers are publicly accessible"
on storage.objects for select
to public
using (bucket_id = 'covers');
