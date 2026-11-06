-- Jalankan sekali di Supabase Dashboard > SQL Editor.
-- Bucket publik agar foto dapat dilihat pengunjung tanpa login.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory-photos', 'memory-photos', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  description text not null default '',
  photo_date date,
  created_at timestamptz not null default now()
);

alter table public.gallery_photos enable row level security;

drop policy if exists "Anyone can view gallery metadata" on public.gallery_photos;
create policy "Anyone can view gallery metadata"
on public.gallery_photos for select
to anon, authenticated
using (true);

drop policy if exists "Signed-in users can add gallery metadata" on public.gallery_photos;
create policy "Signed-in users can add gallery metadata"
on public.gallery_photos for insert
to authenticated
with check (true);

drop policy if exists "Public can view gallery images" on storage.objects;
create policy "Public can view gallery images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'memory-photos');

drop policy if exists "Signed-in users can upload gallery images" on storage.objects;
create policy "Signed-in users can upload gallery images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'memory-photos');
