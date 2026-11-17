-- seed.sql
-- Datos iniciales y catálogo oficial: Heladería Dulce Tentación y algo más (Ibagué, Colombia).
-- Idempotente (ON CONFLICT DO UPDATE / DO NOTHING): compatible con ejecuciones repetidas.

-- Sedes ---------------------------------------------------------------
insert into public.sedes
  (slug, nombre, direccion, barrio, whatsapp, telefono, maps_url, domicilios,
   horario_nota, horario_nota_en, orden)
values
  ('belen', 'Dulce Tentación - Belén', 'Cra 7 # 5-35', 'Belén',
   '573017430183', '301 743 0183',
   'https://www.google.com/maps/search/?api=1&query=Dulce+Tentacion+Cra+7+5-35+Belen+Ibague',
   true,
   'Atención todos los días hasta las 9:00 p.m.', 'Open daily until 9:00 p.m.', 1),
  ('ambala', 'Dulce Tentación - Ambalá', 'Calle 64 (Av. Ambalá) # 21-47', 'Ambalá (Plazas del Bosque)',
   '573197873476', '319 787 3476',
   'https://www.google.com/maps/search/?api=1&query=Dulce+Tentacion+Calle+64+21-47+Ibague',
   true,
   'L-V: 1:00 p.m. - 9:00 p.m. | S-D: 11:00 a.m. - 9:00 p.m.',
   'Mon-Fri: 1:00 p.m. - 9:00 p.m. | Sat-Sun: 11:00 a.m. - 9:00 p.m.', 2)
on conflict (slug) do update set
  nombre = excluded.nombre,
  direccion = excluded.direccion,
  barrio = excluded.barrio,
  whatsapp = excluded.whatsapp,
  telefono = excluded.telefono,
  maps_url = excluded.maps_url,
  horario_nota = excluded.horario_nota,
  horario_nota_en = excluded.horario_nota_en,
  domicilios = excluded.domicilios;

-- Categorías ----------------------------------------------------------
insert into public.categories (slug, nombre, nombre_en, orden) values
  ('waffles',   'Waffles',               'Waffles',              1),
  ('cholados',  'Cholados',              'Cholados',             2),
  ('copas',     'Copas y Helados',       'Ice Cream Cups',       3),
  ('ensaladas', 'Ensaladas de Frutas',   'Fruit Salads',         4),
  ('postres',   'Postres y Repostería',  'Desserts & Pastries',  5),
  ('crepes',    'Crepes',                'Crepes',               6)
on conflict (slug) do update set
  nombre = excluded.nombre,
  nombre_en = excluded.nombre_en,
  orden = excluded.orden;

-- Productos reales verificados de Dulce Tentación en Ibagué ------------
insert into public.products (slug, nombre, nombre_en, descripcion, descripcion_en, category_id, destacado)
select
  v.slug,
  v.nombre,
  v.nombre_en,
  v.descripcion,
  v.descripcion_en,
  c.id,
  v.destacado
from (values
  -- Waffles
  ('waffle-selva-negra',
   'Waffle Selva Negra',
   'Black Forest Waffle',
   'Waffle crocante recién horneado con helado cremoso, banano, fresas frescas, galleta Oreo, barquillos artesanales y crema chantilly.',
   'Crispy freshly baked waffle with creamy ice cream, banana, fresh strawberries, Oreo cookie, artisan wafer sticks, and whipped cream.',
   'waffles', true),

  ('waffle-nutella-fresas-banano',
   'Waffle con Nutella, Fresas y Banano',
   'Nutella, Strawberry & Banana Waffle',
   'Base de waffle dorada con generosa capa de Nutella, fresas seleccionadas, banano dulce, chantilly y dos bolas de helado.',
   'Golden waffle base with a rich layer of Nutella, fresh strawberries, sweet banana, whipped cream, and two scoops of ice cream.',
   'waffles', true),

  ('waffle-chocoloso',
   'Waffle Chocoloso',
   'Choco-Lover Waffle',
   'Para los amantes del cacao: waffle caliente bañado en salsa fudge, trozos de brownie melcochudo, chips de chocolate y helado.',
   'For cocoa lovers: warm waffle covered in chocolate fudge, chewy brownie chunks, chocolate chips, and ice cream.',
   'waffles', false),

  ('waffle-cheesecake-frutos-rojos',
   'Waffle Cheesecake Frutos Rojos',
   'Berry Cheesecake Waffle',
   'Waffle artesanal con suave crema de cheesecake, salsa casera de frutos rojos silvestres, fresas y helado de vainilla.',
   'Artisan waffle with velvety cheesecake cream, homemade forest berry compote, strawberries, and vanilla ice cream.',
   'waffles', false),

  -- Crepes
  ('crepe-tentacion',
   'Crepe Dulce Tentación',
   'Dulce Tentación Sweet Crepe',
   'Crepe artesanal caliente relleno de Nutella, fresas frescas, banano, galletas Oreo trituradas, queso campesino, chantilly y bola de helado.',
   'Warm artisan crepe stuffed with Nutella, fresh strawberries, banana, crushed Oreo cookies, Colombian cheese, whipped cream, and an ice cream scoop.',
   'crepes', true),

  ('crepe-frutos-rojos-arequipe',
   'Crepe de Frutos Rojos y Arequipe',
   'Wild Berries & Dulce de Leche Crepe',
   'Fina masa de crepe rellena de arequipe artesanal de la casa, reducción de moras y frutos rojos silvestres, fresas y helado cremoso.',
   'Delicate crepe filled with artisan dulce de leche, wild berry compote, fresh strawberries, and creamy ice cream.',
   'crepes', false),

  -- Copas y Helados
  ('copa-gigante-fresas-chantilli-chocolate',
   'Copa Gigante de Fresas con Chantillí y Chocolate',
   'Giant Strawberry Cup with Chocolate Chantilly',
   'Nuestra creación insignia: copa monumental con capas de fresas frescas, helado premium, chantillí de chocolate especial y barquillos.',
   'Our signature dessert: monumental goblet layered with fresh strawberries, premium ice cream, chocolate whipped cream, and wafer sticks.',
   'copas', true),

  ('canoa-tentacion',
   'Canoa Tentación',
   'Tentación Ice Cream Boat',
   'Tres porciones generosas de helado en barca con bocados de brownie, fresas, durazno, queso campesino rallado, barquillos y chantilly.',
   'Three generous scoops of ice cream in a dessert boat with brownie bites, strawberries, peach, grated fresh cheese, wafers, and chantilly.',
   'copas', true),

  ('copa-waffle-brownie',
   'Copa Waffle Brownie Tentación',
   'Waffle Brownie Temptation Cup',
   'Espectacular combinación de trozos de waffle caliente crujiente, brownie melcochudo, dos porciones de helado, fudge de chocolate y chantilly.',
   'Spectacular combination of crispy warm waffle bites, chewy brownie, two ice cream scoops, chocolate fudge, and whipped cream.',
   'copas', true),

  ('banana-split',
   'Banana Split Clásico',
   'Classic Banana Split',
   'El clásico indiscutible: banano fresco abierto con 3 sabores de helado, crema de leche, lluvia de queso, cereza, durazno y barquillo.',
   'The all-time classic: fresh sliced banana with 3 ice cream scoops, sweet cream, cheese topping, cherry, peach, and wafer.',
   'copas', true),

  ('super-bananito',
   'Super Bananito Tentación',
   'Super Bananito Specialty',
   'Delicia especial con base de banano maduro caramelizado, doble porción de helado, crema de leche de la casa, queso y lechera.',
   'Special indulgence with caramelized ripe banana base, double ice cream scoop, house sweet cream, grated cheese, and condensed milk.',
   'copas', false),

  -- Cholados
  ('cholado-tentacion',
   'Cholado Tentación Especial',
   'Special Cholado Tentación',
   'Hielo frapeado bañado en almíbar de frutas naturales, piña, maracuyá, papaya, melón, queso campesino, bola de helado y leche condensada.',
   'Finely shaved ice with natural fruit syrups, pineapple, passion fruit, papaya, melon, artisan cheese, ice cream scoop, and condensed milk.',
   'cholados', true),

  ('cholado-tradicional-frutas',
   'Cholado Tradicional con Frutas',
   'Traditional Fruit Cholado',
   'Refrescante raspado tradicional del Valle con mezcla de frutas frescas tropicales, galleta, dulce de mora y abundante leche condensada.',
   'Refreshing traditional shaved ice with tropical fruit mix, sweet blackberry sauce, wafer cookie, and rich condensed milk.',
   'cholados', false),

  -- Ensaladas de Frutas
  ('ensalada-frutas-helado-brownie',
   'Ensalada de Frutas con Helado y Brownie',
   'Fruit Salad with Ice Cream & Brownie',
   'Combinación perfecta de papaya, melón, banano, manzana y fresas con crema de leche especial, queso fresco, brownie melcochudo y helado.',
   'Fresh blend of papaya, melon, banana, apple, and strawberries topped with sweet cream, fresh cheese, fudge brownie, and ice cream.',
   'ensaladas', true),

  ('ensalada-especial-dulce-tentacion',
   'Ensalada Especial Dulce Tentación',
   'Dulce Tentación Special Fruit Salad',
   'Copa abundante con mix de frutas seleccionadas, queso campesino en hebras, crema dulce, barquillos crocantes y 2 bolas de helado al gusto.',
   'Abundant fruit cup with shredded Colombian cheese, sweet cream, crispy wafers, and two scoops of ice cream of your choice.',
   'ensaladas', true),

  -- Postres y Repostería
  ('fresas-con-crema',
   'Fresas con Crema Artesanal',
   'Artisan Strawberries & Cream',
   'Fresas frescas seleccionadas del día, sumergidas en crema batida artesanal con notas de vainilla, lechera y lluvia de chocolate o queso.',
   'Handpicked fresh strawberries immersed in artisan vanilla whipped cream, condensed milk, and chocolate flakes or grated cheese.',
   'postres', true),

  ('postre-bananito',
   'Postre Bananito',
   'Bananito Sweet Dessert',
   'Tradicional porción dulce de banano tierno con crema dulce espesa, lluvia de queso campesino fresco y leche condensada.',
   'Traditional sweet treat of sliced ripe banana, thick sweet cream, grated Colombian cheese, and sweet condensed milk.',
   'postres', false),

  ('torta-zanahoria-nueces',
   'Torta de Zanahoria con Nueces',
   'Carrot Cake with Pecan Nuts',
   'Porción horneada de torta especiada de zanahoria con canela y nueces crujientes, con suave cubierta de crema de queso blanco.',
   'Moist spiced carrot cake slice baked with cinnamon and crunchy pecans, finished with a smooth cream cheese glaze.',
   'postres', false),

  ('malteada-tentacion-oreo',
   'Malteada Tentación Oreo',
   'Oreo Tentación Milkshake',
   'Batido espeso y frío de helado de vainilla y chocolate con galletas Oreo trituradas, salsa de chocolate fudge, chantilly y cereza.',
   'Thick, chilled vanilla and chocolate ice cream shake blended with crushed Oreo cookies, fudge drizzle, whipped cream, and a cherry.',
   'postres', false)
) as v (slug, nombre, nombre_en, descripcion, descripcion_en, cat_slug, destacado)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do update set
  nombre = excluded.nombre,
  nombre_en = excluded.nombre_en,
  descripcion = excluded.descripcion,
  descripcion_en = excluded.descripcion_en,
  category_id = excluded.category_id,
  destacado = excluded.destacado;

-- Precios por sede en pesos colombianos (COP) -------------------------
insert into public.product_prices (product_id, sede_id, precio_cop, disponible)
select
  p.id,
  s.id,
  case p.slug
    when 'waffle-selva-negra' then 23000
    when 'waffle-nutella-fresas-banano' then 21000
    when 'waffle-chocoloso' then 22000
    when 'waffle-cheesecake-frutos-rojos' then 24000
    when 'crepe-tentacion' then 21000
    when 'crepe-frutos-rojos-arequipe' then 20000
    when 'copa-gigante-fresas-chantilli-chocolate' then 18000
    when 'canoa-tentacion' then 25000
    when 'copa-waffle-brownie' then 21000
    when 'banana-split' then 22000
    when 'super-bananito' then 20000
    when 'cholado-tentacion' then 16000
    when 'cholado-tradicional-frutas' then 14000
    when 'ensalada-frutas-helado-brownie' then 20000
    when 'ensalada-especial-dulce-tentacion' then 23000
    when 'fresas-con-crema' then 15000
    when 'postre-bananito' then 12000
    when 'torta-zanahoria-nueces' then 13000
    when 'malteada-tentacion-oreo' then 16000
    else 18000
  end as precio_cop,
  true as disponible
from public.products p
cross join public.sedes s
on conflict (product_id, sede_id) do update set
  precio_cop = excluded.precio_cop,
  disponible = excluded.disponible;

-- Ajustes editables ---------------------------------------------------
insert into public.site_settings (clave, valor)
select 'producto_del_momento',
       jsonb_build_object('product_id', p.id::text, 'activo', true)
from public.products p
where p.slug = 'copa-gigante-fresas-chantilli-chocolate'
on conflict (clave) do update set
  valor = excluded.valor;

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
