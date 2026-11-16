-- 0006_click_stats.sql
-- Conteo agregado de clics en botones (WhatsApp, cómo llegar) por sede y por día.
-- NO guarda IP, usuario ni cookies: solo un contador. Solo el servidor (service_role) puede sumar.

create table public.click_stats (
  id        uuid primary key default gen_random_uuid(),
  sede_id   uuid not null references public.sedes (id) on delete cascade,
  dia       date not null,
  canal     text not null check (canal in ('whatsapp_fab', 'whatsapp_sede', 'whatsapp_pedido', 'como_llegar')),
  total     integer not null default 0 check (total >= 0),
  unique (sede_id, dia, canal)
);

create index idx_click_stats_dia on public.click_stats (dia desc);

alter table public.click_stats enable row level security;
revoke all on public.click_stats from anon, authenticated;
grant select on public.click_stats to authenticated;

-- Solo un admin puede leer las estadísticas. Nadie escribe desde la API pública.
create policy click_stats_select_admin on public.click_stats
  for select to authenticated using (public.is_admin());

-- Suma 1 al contador del día (hora de Colombia). Solo la ejecuta el servidor con service_role,
-- así nadie puede inflar las cifras llamando a la API directamente con la clave pública.
create or replace function public.increment_click(p_sede_slug text, p_canal text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sede uuid;
begin
  select id into v_sede from public.sedes where slug = p_sede_slug and activa;
  if v_sede is null then
    return;
  end if;

  insert into public.click_stats (sede_id, dia, canal, total)
  values (v_sede, (now() at time zone 'America/Bogota')::date, p_canal, 1)
  on conflict (sede_id, dia, canal)
  do update set total = public.click_stats.total + 1;
end;
$$;

revoke all on function public.increment_click(text, text) from public, anon, authenticated;
grant execute on function public.increment_click(text, text) to service_role;
