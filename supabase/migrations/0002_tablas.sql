-- 0002_tablas.sql
-- Tablas del sitio de Heladería Dulce Tentación y algo más.
-- Idiomas: español (principal, columnas sin sufijo) e inglés (sufijo _en, opcional).
-- El sitio NO guarda pedidos, reservas ni datos de clientes: todo viaja a WhatsApp.

-- ---------------------------------------------------------------------
-- profiles: un perfil por usuario administrador (vinculado a Supabase Auth).
-- No hay registro público: los admins se crean a mano desde el panel de Supabase.
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null check (char_length(nombre) between 1 and 80),
  rol         text not null default 'admin' check (rol in ('admin')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- sedes: una fila por sede. whatsapp NULL = sede sin WhatsApp (se muestra "Pronto").
-- ---------------------------------------------------------------------
create table public.sedes (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  nombre           text not null check (char_length(nombre) between 1 and 120),
  direccion        text not null check (char_length(direccion) between 1 and 200),
  barrio           text check (barrio is null or char_length(barrio) <= 80),
  ciudad           text not null default 'Ibagué' check (char_length(ciudad) <= 80),
  whatsapp         text check (whatsapp is null or whatsapp ~ '^57[0-9]{10}$'),
  telefono         text check (telefono is null or telefono ~ '^[0-9 +()-]{7,20}$'),
  maps_url         text check (maps_url is null
                   or maps_url ~ '^https://(www\.google\.com/maps|maps\.app\.goo\.gl|goo\.gl/maps)'),
  maps_embed_url   text check (maps_embed_url is null
                   or maps_embed_url ~ '^https://www\.google\.com/maps'),
  horarios         jsonb not null default '{}'::jsonb check (jsonb_typeof(horarios) = 'object'),
  horario_nota     text check (horario_nota is null or char_length(horario_nota) <= 200),
  horario_nota_en  text check (horario_nota_en is null or char_length(horario_nota_en) <= 200),
  domicilios       boolean not null default false,
  domicilio_info   jsonb not null default '{}'::jsonb check (jsonb_typeof(domicilio_info) = 'object'),
  activa           boolean not null default true,
  orden            integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  nombre      text not null check (char_length(nombre) between 1 and 80),
  nombre_en   text check (nombre_en is null or char_length(nombre_en) <= 80),
  orden       integer not null default 0,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- products: el producto es único; el precio va por sede en product_prices.
-- es_ejemplo = true marca datos de muestra para ocultarlos antes de publicar.
-- ---------------------------------------------------------------------
create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  nombre          text not null check (char_length(nombre) between 1 and 120),
  nombre_en       text check (nombre_en is null or char_length(nombre_en) <= 120),
  descripcion     text check (descripcion is null or char_length(descripcion) <= 600),
  descripcion_en  text check (descripcion_en is null or char_length(descripcion_en) <= 600),
  category_id     uuid not null references public.categories (id) on delete restrict,
  image_path      text check (image_path is null or char_length(image_path) <= 300),
  destacado       boolean not null default false,
  activo          boolean not null default true,
  es_ejemplo      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- product_prices: precio y disponibilidad por producto y sede.
-- precio_cop NULL = "Consultar precio". Pesos colombianos enteros.
-- ---------------------------------------------------------------------
create table public.product_prices (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  sede_id     uuid not null references public.sedes (id) on delete cascade,
  precio_cop  integer check (precio_cop is null or (precio_cop >= 0 and precio_cop <= 10000000)),
  disponible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, sede_id)
);

-- ---------------------------------------------------------------------
-- promotions: banners o promos con vigencia. sede_id NULL = todas las sedes.
-- ---------------------------------------------------------------------
create table public.promotions (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null check (char_length(titulo) between 1 and 120),
  titulo_en   text check (titulo_en is null or char_length(titulo_en) <= 120),
  texto       text check (texto is null or char_length(texto) <= 400),
  texto_en    text check (texto_en is null or char_length(texto_en) <= 400),
  sede_id     uuid references public.sedes (id) on delete cascade,
  desde       timestamptz not null,
  hasta       timestamptz not null,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (hasta > desde)
);

-- ---------------------------------------------------------------------
-- site_settings: textos y ajustes editables. publico = false => solo admin la lee.
-- ---------------------------------------------------------------------
create table public.site_settings (
  id          uuid primary key default gen_random_uuid(),
  clave       text not null unique check (clave ~ '^[a-z0-9_]+$' and char_length(clave) <= 60),
  valor       jsonb not null default '{}'::jsonb,
  publico     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- audit_log: registro de cambios (quién, cuándo, qué). Solo lo escriben los triggers.
-- ---------------------------------------------------------------------
create table public.audit_log (
  id        bigint generated always as identity primary key,
  actor_id  uuid,
  tabla     text not null,
  fila_id   uuid,
  accion    text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  antes     jsonb,
  despues   jsonb,
  at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Índices (las claves únicas ya crean los suyos).
-- ---------------------------------------------------------------------
create index idx_products_category on public.products (category_id);
create index idx_product_prices_sede on public.product_prices (sede_id);
create index idx_promotions_vigencia on public.promotions (activa, desde, hasta);
create index idx_promotions_sede on public.promotions (sede_id);
create index idx_audit_tabla_fecha on public.audit_log (tabla, at desc);
