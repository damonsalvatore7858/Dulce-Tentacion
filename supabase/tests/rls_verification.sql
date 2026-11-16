-- tests/rls_verification.sql
-- Verifica que anónimos y usuarios NO admin no puedan insertar, modificar ni borrar,
-- que no vean filas inactivas, y que un admin SÍ pueda escribir y quede auditado.
-- Ejecutar en el SQL Editor del proyecto DEV, después de migraciones y seed.
-- Todo corre dentro de una transacción que termina en ROLLBACK: no deja rastro.
-- Si algo falla, el script se detiene con un mensaje "FALLO ...".

begin;

create or replace function pg_temp.expect_denied(p_role text, p_sql text, p_label text)
returns void language plpgsql as $$
declare v_rows bigint;
begin
  execute format('set local role %I', p_role);
  begin
    execute p_sql;
    get diagnostics v_rows = row_count;
    reset role;
    if v_rows > 0 then
      raise exception 'FALLO [%] %: afectó % fila(s)', p_role, p_label, v_rows;
    end if;
    raise notice 'OK    [%] %: 0 filas', p_role, p_label;
  exception when insufficient_privilege then
    reset role;
    raise notice 'OK    [%] %: denegado', p_role, p_label;
  end;
end;
$$;

create or replace function pg_temp.expect_rows(p_role text, p_sql text, p_label text)
returns void language plpgsql as $$
declare v_rows bigint;
begin
  execute format('set local role %I', p_role);
  execute p_sql;
  get diagnostics v_rows = row_count;
  reset role;
  if v_rows = 0 then
    raise exception 'FALLO [%] %: se esperaban filas y no hubo', p_role, p_label;
  end if;
  raise notice 'OK    [%] %: % fila(s)', p_role, p_label, v_rows;
end;
$$;

-- 0) Todas las tablas de public tienen RLS activo.
do $$
declare v text;
begin
  select string_agg(c.relname, ', ') into v
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if v is not null then
    raise exception 'FALLO: tablas sin RLS: %', v;
  end if;
  raise notice 'OK    todas las tablas de public tienen RLS activo';
end;
$$;

-- Datos de prueba que NO deben ser visibles al público.
insert into public.categories (slug, nombre, activa) values ('zz-test-inactiva', 'Test', false);
insert into public.promotions (titulo, desde, hasta, activa)
values ('zz-test-vencida', now() - interval '10 days', now() - interval '5 days', true);

-- Usuario simulado NO admin (no existe en profiles).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000aa', true);
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000aa', 'role', 'authenticated')::text, true);

-- 1) Anónimo y no admin: escritura denegada en todas las tablas.
do $$
declare
  r text;
  t text;
  ins text;
  inserts text[] := array[
    $q$insert into public.sedes (slug, nombre, direccion) values ('zz-hack', 'x', 'x')$q$,
    $q$insert into public.categories (slug, nombre) values ('zz-hack', 'x')$q$,
    $q$insert into public.products (slug, nombre, category_id) values ('zz-hack', 'x', gen_random_uuid())$q$,
    $q$insert into public.product_prices (product_id, sede_id, precio_cop) values (gen_random_uuid(), gen_random_uuid(), 1)$q$,
    $q$insert into public.promotions (titulo, desde, hasta) values ('x', now(), now() + interval '1 day')$q$,
    $q$insert into public.site_settings (clave, valor) values ('zz_hack', '{}'::jsonb)$q$,
    $q$insert into public.profiles (id, nombre, rol) values (gen_random_uuid(), 'x', 'admin')$q$,
    $q$insert into public.audit_log (tabla, accion) values ('x', 'INSERT')$q$,
    $q$insert into storage.objects (bucket_id, name) values ('product-images', 'zz-hack.png')$q$
  ];
  tablas text[] := array[
    'sedes', 'categories', 'products', 'product_prices',
    'promotions', 'site_settings', 'profiles'
  ];
begin
  foreach r in array array['anon', 'authenticated'] loop
    foreach ins in array inserts loop
      perform pg_temp.expect_denied(r, ins, 'INSERT ' || left(ins, 45));
    end loop;
    foreach t in array tablas loop
      perform pg_temp.expect_denied(r,
        format('update public.%I set created_at = created_at', t), 'UPDATE ' || t);
      perform pg_temp.expect_denied(r,
        format('delete from public.%I', t), 'DELETE ' || t);
    end loop;
    perform pg_temp.expect_denied(r, 'update public.audit_log set tabla = tabla', 'UPDATE audit_log');
    perform pg_temp.expect_denied(r, 'delete from public.audit_log', 'DELETE audit_log');
    perform pg_temp.expect_denied(r, 'delete from storage.objects where bucket_id = ''product-images''',
      'DELETE storage.objects');
  end loop;
end;
$$;

-- 2) Lectura: no ven audit_log, perfiles ajenos, filas inactivas ni promos vencidas.
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    perform pg_temp.expect_denied(r, 'select 1 from public.audit_log', 'SELECT audit_log');
    perform pg_temp.expect_denied(r, 'select 1 from public.profiles', 'SELECT profiles ajenos');
    perform pg_temp.expect_denied(r,
      'select 1 from public.categories where slug = ''zz-test-inactiva''', 'ver categoría inactiva');
    perform pg_temp.expect_denied(r,
      'select 1 from public.promotions where titulo = ''zz-test-vencida''', 'ver promoción vencida');
    -- Control positivo: sí ven el catálogo activo.
    perform pg_temp.expect_rows(r, 'select 1 from public.sedes where activa', 'ver sedes activas');
    perform pg_temp.expect_rows(r, 'select 1 from public.products where activo', 'ver productos activos');
    perform pg_temp.expect_rows(r, 'select 1 from public.product_prices', 'ver precios');
  end loop;
end;
$$;

-- 3) Control positivo: un admin SÍ escribe y queda en audit_log.
-- Si tu versión de Supabase rechaza este INSERT en auth.users, comenta esta sección:
-- las pruebas de denegación de arriba ya cubren lo crítico.
insert into auth.users (id, aud, role, email)
values ('00000000-0000-0000-0000-0000000000ad', 'authenticated', 'authenticated',
        'admin-prueba@example.invalid');
insert into public.profiles (id, nombre, rol)
values ('00000000-0000-0000-0000-0000000000ad', 'Admin de prueba', 'admin');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000ad', true);
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000ad', 'role', 'authenticated')::text, true);

select pg_temp.expect_rows('authenticated',
  'insert into public.categories (slug, nombre) values (''zz-admin-ok'', ''ok'')',
  'admin inserta categoría');
select pg_temp.expect_rows('authenticated',
  'update public.categories set nombre = ''ok2'' where slug = ''zz-admin-ok''',
  'admin actualiza categoría');
select pg_temp.expect_rows('authenticated',
  'select 1 from public.audit_log where tabla = ''categories''',
  'admin lee audit_log');

do $$
begin
  if not exists (
    select 1 from public.audit_log
    where tabla = 'categories'
      and actor_id = '00000000-0000-0000-0000-0000000000ad'
  ) then
    raise exception 'FALLO: el cambio del admin no quedó registrado en audit_log';
  end if;
  raise notice 'OK    el cambio del admin quedó registrado con su id';
end;
$$;

-- 4) Estadísticas de clics: nadie del público puede leer, escribir ni ejecutar la función.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000aa', true);
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-0000-0000-0000000000aa', 'role', 'authenticated')::text, true);

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    perform pg_temp.expect_denied(r, 'select 1 from public.click_stats', 'SELECT click_stats');
    perform pg_temp.expect_denied(r,
      'insert into public.click_stats (sede_id, dia, canal, total) values (gen_random_uuid(), current_date, ''como_llegar'', 999)',
      'INSERT click_stats');
    perform pg_temp.expect_denied(r, 'update public.click_stats set total = 0', 'UPDATE click_stats');
    perform pg_temp.expect_denied(r, 'delete from public.click_stats', 'DELETE click_stats');
    perform pg_temp.expect_denied(r, 'select public.increment_click(''belen'', ''whatsapp_fab'')',
      'EJECUTAR increment_click');
  end loop;
end;
$$;

select 'TODAS LAS PRUEBAS PASARON' as resultado;

rollback;
