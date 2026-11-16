-- 0004_rls_y_permisos.sql
-- RLS activo en TODAS las tablas + permisos mínimos (defensa en profundidad).

alter table public.profiles        enable row level security;
alter table public.sedes           enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_prices  enable row level security;
alter table public.promotions      enable row level security;
alter table public.site_settings   enable row level security;
alter table public.audit_log       enable row level security;

-- Permisos de tabla: se quita todo y se concede solo lo necesario.
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

grant select on public.sedes, public.categories, public.products,
                public.product_prices, public.promotions, public.site_settings
  to anon, authenticated;
grant select on public.profiles, public.audit_log to authenticated;
grant insert, update, delete on public.sedes, public.categories, public.products,
                public.product_prices, public.promotions, public.site_settings
  to authenticated;
-- profiles y audit_log: nadie escribe desde la API (profiles se gestiona desde el panel
-- de Supabase; audit_log lo escriben los triggers).

-- ---------------------------------------------------------------------
-- Lectura pública: solo filas activas.
-- ---------------------------------------------------------------------
create policy sedes_select_publico on public.sedes
  for select to anon, authenticated using (activa);

create policy categories_select_publico on public.categories
  for select to anon, authenticated using (activa);

create policy products_select_publico on public.products
  for select to anon, authenticated using (activo);

-- Precios: solo de productos activos en sedes activas.
create policy product_prices_select_publico on public.product_prices
  for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.activo)
    and exists (select 1 from public.sedes s where s.id = sede_id and s.activa)
  );

create policy promotions_select_publico on public.promotions
  for select to anon, authenticated
  using (activa and now() >= desde and now() <= hasta);

create policy site_settings_select_publico on public.site_settings
  for select to anon, authenticated using (publico);

-- ---------------------------------------------------------------------
-- Admin: lectura y escritura completas, verificadas con is_admin().
-- ---------------------------------------------------------------------
create policy sedes_admin_todo on public.sedes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy categories_admin_todo on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy products_admin_todo on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy product_prices_admin_todo on public.product_prices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy promotions_admin_todo on public.promotions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy site_settings_admin_todo on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- profiles: cada usuario solo lee su propio perfil. Sin políticas de escritura.
create policy profiles_select_propio on public.profiles
  for select to authenticated using (id = (select auth.uid()));

-- audit_log: solo lectura para admin. Sin políticas de escritura.
create policy audit_log_select_admin on public.audit_log
  for select to authenticated using (public.is_admin());
