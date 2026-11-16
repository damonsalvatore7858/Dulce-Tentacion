-- 0005_storage.sql
-- Bucket de imágenes de productos y sedes.
-- Lectura pública por URL (bucket público). Escritura solo admin.
-- Límite 2 MB y tipos permitidos a nivel de bucket; la app valida además el tipo MIME real.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_insert_admin on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_update_admin on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy product_images_delete_admin on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
