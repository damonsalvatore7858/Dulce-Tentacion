-- seed.sql
-- Datos iniciales: SOLO información real entregada por el dueño. Idempotente
-- (ON CONFLICT DO NOTHING): si el admin ya editó algo, no se pisa.
-- Lo PENDIENTE queda en NULL / '{}' y se completa desde el panel admin.

-- Sedes ---------------------------------------------------------------
insert into public.sedes
  (slug, nombre, direccion, barrio, whatsapp, telefono, domicilios,
   horario_nota, horario_nota_en, orden)
values
  ('belen', 'Dulce Tentación - Belén', 'Cra 7 # 5-35', 'Belén',
   '573017430183', '301 743 0183', true,
   'Cierra a las 9 p.m.', 'Closes at 9 p.m.', 1),
  ('ambala', 'Dulce Tentación - Ambalá', 'Calle 64 (Av. Ambalá) # 21-47', 'Ambalá',
   null, null, true,
   'Cierra a las 9 p.m.', 'Closes at 9 p.m.', 2)
on conflict (slug) do nothing;
-- Dulce Rosé NO se incluye hasta que el dueño confirme que es sub-marca propia.

-- Categorías ----------------------------------------------------------
insert into public.categories (slug, nombre, nombre_en, orden) values
  ('waffles',   'Waffles',   'Waffles',      1),
  ('cholados',  'Cholados',  'Cholados',     2),
  ('copas',     'Copas',     'Ice cream cups', 3),
  ('ensaladas', 'Ensaladas de frutas', 'Fruit salads', 4),
  ('postres',   'Postres',   'Desserts',     5)
on conflict (slug) do nothing;

-- Productos reales conocidos (sin descripciones inventadas) -------------
insert into public.products (slug, nombre, nombre_en, category_id, destacado)
select v.slug, v.nombre, v.nombre_en, c.id, v.destacado
from (values
  ('ensalada-frutas-helado-brownie', 'Ensalada de frutas con helado y brownie',
   'Fruit salad with ice cream and brownie', 'ensaladas', true),
  ('cholado-tentacion', 'Cholado Tentación', 'Cholado Tentación', 'cholados', true),
  ('waffle-selva-negra', 'Waffle selva negra', 'Black Forest waffle', 'waffles', true),
  ('fresas-con-crema', 'Fresas con crema', 'Strawberries and cream', 'postres', true),
  ('copa-gigante-fresas-chantilli-chocolate',
   'Copa gigante de fresas con chantillí de chocolate',
   'Giant strawberry cup with chocolate whipped cream', 'copas', true)
) as v (slug, nombre, nombre_en, cat_slug, destacado)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do nothing;

-- Precios por sede: NULL = "Consultar precio". Único precio conocido: la copa gigante
-- ($18.000, anunciado por la marca). Se asume igual en ambas sedes; editable en el admin.
insert into public.product_prices (product_id, sede_id, precio_cop, disponible)
select p.id, s.id,
       case when p.slug = 'copa-gigante-fresas-chantilli-chocolate' then 18000 end,
       true
from public.products p
cross join public.sedes s
on conflict (product_id, sede_id) do nothing;

-- Ajustes editables ---------------------------------------------------
insert into public.site_settings (clave, valor)
select 'producto_del_momento',
       jsonb_build_object('product_id', p.id::text, 'activo', true)
from public.products p
where p.slug = 'copa-gigante-fresas-chantilli-chocolate'
on conflict (clave) do nothing;

insert into public.site_settings (clave, valor) values
  ('eslogan',
   jsonb_build_object(
     'es', jsonb_build_array('Antojo, es un momento para ti', 'Date el gusto, te lo mereces'),
     'en', jsonb_build_array('A craving is a moment for you', 'Treat yourself, you deserve it'))),
  ('banner',
   jsonb_build_object('activo', false, 'texto_es', '', 'texto_en', '')),
  ('redes',
   jsonb_build_object('instagram', 'https://www.instagram.com/dulcetentacionyalgomas/')),
  ('modulos',
   jsonb_build_object('eventos', true, 'reservas', true))
on conflict (clave) do nothing;
