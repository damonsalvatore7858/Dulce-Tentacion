-- 0006_product_videos.sql
-- Agregar columna video_url a products para videos promocionales (archivos o enlaces a redes)
alter table public.products
  add column if not exists video_url text check (video_url is null or char_length(video_url) <= 500);

-- Actualizar límite del bucket product-images a 10 MB (10485760 bytes)
update storage.buckets
set file_size_limit = 10485760
where id = 'product-images';

-- Bucket de videos promocionales de productos (hasta 25 MB: MP4 y WebM)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-videos', 'product-videos', true, 26214400,
  array['video/mp4', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy product_videos_insert_admin on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-videos' and public.is_admin());

create policy product_videos_update_admin on storage.objects
  for update to authenticated
  using (bucket_id = 'product-videos' and public.is_admin())
  with check (bucket_id = 'product-videos' and public.is_admin());

create policy product_videos_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-videos' and public.is_admin());
