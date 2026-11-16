-- 0003_funciones_y_triggers.sql
-- is_admin(): la base de datos decide quién es admin. No se confía en claims del cliente.
-- audit_row(): registra cada cambio con el usuario autenticado.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.rol = 'admin'
      and p.activo
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (actor_id, tabla, fila_id, accion, antes, despues)
    values ((select auth.uid()), tg_table_name, new.id, tg_op, null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (actor_id, tabla, fila_id, accion, antes, despues)
    values ((select auth.uid()), tg_table_name, new.id, tg_op, to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into public.audit_log (actor_id, tabla, fila_id, accion, antes, despues)
    values ((select auth.uid()), tg_table_name, old.id, tg_op, to_jsonb(old), null);
    return old;
  end if;
end;
$$;

revoke all on function public.audit_row() from public, anon, authenticated;

-- Triggers de updated_at y de auditoría en todas las tablas editables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'sedes', 'categories', 'products',
    'product_prices', 'promotions', 'site_settings'
  ]
  loop
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$I
         for each row execute function public.set_updated_at()', t);
    execute format(
      'create trigger trg_%1$s_audit after insert or update or delete on public.%1$I
         for each row execute function public.audit_row()', t);
  end loop;
end;
$$;
