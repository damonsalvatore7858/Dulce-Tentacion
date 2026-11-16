# Heladería Dulce Tentación y algo más 🍨🍓

Sitio web corporativo, catálogo interactivo por sede con canalización de pedidos a WhatsApp y panel de administración autogestionable para la heladería **Dulce Tentación y algo más** (Ibagué, Tolima, Colombia).

---

## 📌 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
6. [Variables de Entorno](#-variables-de-entorno)
7. [Base de Datos y Seguridad (Supabase)](#-base-de-datos-y-seguridad-supabase)
8. [Motor de Pedidos por WhatsApp](#-motor-de-pedidos-por-whatsapp)
9. [Guía de Uso del Panel de Administración](#-guía-de-uso-del-panel-de-administración)
10. [SEO Local y Datos Estructurados](#-seo-local-y-datos-estructurados)
11. [Opciones de Despliegue en Producción](#-opciones-de-despliegue-en-producción)
12. [Checklist de Verificación Manual](#-checklist-de-verificación-manual)

---

## 🌟 Características Principales

- **Mobile-First & Rendimiento Extremo:** Optimizado para dispositivos móviles (de donde proviene el 90%+ del tráfico de Instagram, Facebook y Maps). Core Web Vitals con LCP < 2.5s y Server Components por defecto.
- **Catálogo Interactivo con Precios por Sede:** Permite consultar la oferta gastronómica filtrada por sede (**Belén** y **Ambalá**), mostrando disponibilidad en tiempo real ("Agotado") y precios diferenciados o "Consultar precio" si no están definidos.
- **Canalización Segura a WhatsApp (Modo B):** El cliente arma su pedido en el navegador; una **Server Action** valida las cantidades con Zod, consulta los precios reales en la base de datos, calcula el total referencial y genera el enlace oficial `wa.me` sin almacenar datos personales ni información financiera en base de datos.
- **Panel Administrativo Autogestionable:** Diseñado para usuarios no técnicos. Permite modificar productos, precios por sede, marcar ítems agotados de inmediato, subir fotos de productos (validadas por firma de bytes), configurar el *Producto del Momento*, banners de promociones y horarios.
- **Seguridad Rigurosa (OWASP):** Row Level Security (RLS) activo en el 100% de las tablas, funciones `SECURITY DEFINER` con `search_path` protegido, protección anti-bot con **Cloudflare Turnstile**, rate limiting en servidor con **Upstash Redis**, autenticación con **Supabase Auth + 2FA**, y cabeceras de seguridad con CSP estricta.
- **Privacidad y Cumplimiento Legal:** Cumple con la Ley 1581 de 2012 de Colombia (Habeas Data). El sitio no guarda pedidos de clientes en bases de datos. Incluye páginas formales de Privacidad, Términos y Cookies.

---

## 💻 Stack Tecnológico

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Framework Web** | Next.js 16 (App Router) | Renderizado del lado del servidor (RSC), generación estática (SSG/ISR) y Server Actions seguras. |
| **Librería UI** | React 19 + TypeScript | Tipado estricto en toda la aplicación; interfaces reactivas sin inconsistencias. |
| **Estilos y Tokens** | Tailwind CSS v4 | Tokens de diseño centralizados (`globals.css`), variables de marca (#F0648C, #34B4E6, #4B2A20), microinteracciones y soporte accesible (WCAG AA). |
| **Base de Datos** | Supabase (PostgreSQL 17) | Motor relacional robusto con RLS estricto, triggers de auditoría inmutables y Storage seguro. |
| **Anti-Bot / Captcha** | Cloudflare Turnstile | Verificación anti-spam sin fricción en formularios y acciones de pedido. |
| **Rate Limiting** | Upstash Redis (@upstash/ratelimit) | Límite de peticiones por IP en servidor para mitigar abusos y denegación de servicio. |
| **Validación** | Zod (v3.24.2) | Validación y saneamiento estricto de esquemas en cliente y servidor. |

---

## 📂 Estructura del Proyecto

```
dulce-tentacion/
├── src/
│   ├── actions/               # Server Actions seguras
│   │   ├── admin/             # Acciones administrativas (catálogo, promos, sedes, auth)
│   │   ├── encargos.ts        # Enlace WhatsApp para eventos/reservas
│   │   ├── pedido.ts          # Generación y cálculo de pedido WhatsApp
│   │   └── stats.ts           # Conteo de clics anónimo
│   ├── app/                   # App Router de Next.js
│   │   ├── [lang]/            # Rutas públicas (/carta, /sedes, /nosotros, etc.)
│   │   ├── admin/             # Panel privado (/admin/productos, /admin/sedes, etc.)
│   │   ├── globals.css        # Design tokens y variables de diseño
│   │   ├── robots.ts          # Configuración de robots.txt
│   │   └── sitemap.ts         # Sitemap dinámico con alternancias
│   ├── components/            # Componentes modulares
│   │   ├── admin/             # Componentes específicos del panel
│   │   ├── layout/            # Cabecera, pie de página, drawer móvil
│   │   ├── menu/              # Tarjetas de producto, selector de sede
│   │   ├── order/             # Barra de pedido flotante y checkout WhatsApp
│   │   ├── sedes/             # Fichas locales y horarios
│   │   └── ui/                # Componentes base accesibles (Button, Card, Input, etc.)
│   ├── i18n/                  # Diccionarios de textos (es-CO principal, en preparado)
│   ├── lib/                   # Librerías y utilidades
│   │   ├── admin/             # Validación MIME real de imágenes (magic bytes)
│   │   ├── auth/              # requireAdmin() para proteger rutas
│   │   ├── data/              # Queries de catálogo con caché y revalidación
│   │   ├── security/          # Turnstile y rate-limit
│   │   ├── supabase/          # Clientes server, public y proxy de sesión
│   │   └── whatsapp/          # Formateador del mensaje referencial para wa.me
│   └── proxy.ts               # Proxy de Next.js 16 (enrutamiento y protección de sesión)
├── supabase/
│   ├── migrations/            # Migraciones SQL numeradas (0001 a 0006)
│   ├── tests/                 # Script de verificación de seguridad RLS
│   └── seed.sql               # Datos iniciales reales del negocio
├── scripts/                   # Scripts de mantenimiento y diagnóstico
│   ├── check-setup.mjs        # Validador de salud del entorno
│   ├── pin-versions.mjs       # Congelador de versiones exactas
│   └── required-deps.mjs      # Lista oficial de dependencias
├── public/                    # Activos estáticos públicos
├── next.config.ts             # Configuración de CSP, dominios de imagen y optimizaciones
└── package.json               # Dependencias fijadas y scripts
```

---

## ⚙️ Requisitos Previos

- **Node.js:** Versión 20.x o 22.x LTS instalada.
- **NPM:** Versión 10+ instalada.
- **Cuenta de Supabase:** Proyecto PostgreSQL activo con credenciales de API.
- **Cuenta de Cloudflare:** Claves de Cloudflare Turnstile (para desarrollo se usan las claves de prueba oficiales).

---

## 🚀 Instalación y Puesta en Marcha

1. **Clonar e ingresar al repositorio:**
   ```bash
   cd dulce-tentacion
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Verificar la salud del entorno:**
   ```bash
   node scripts/check-setup.mjs
   ```
   *Debe responder: `Todo en orden. Ejecuta: npm run dev`.*

4. **Configurar las variables de entorno:**
   Copia el archivo `.env.example` como `.env.local` y ajusta los valores (ver sección siguiente):
   ```bash
   cp .env.example .env.local
   ```

5. **Compilar y validar tipos:**
   ```bash
   npm run build
   ```

6. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🔐 Variables de Entorno

Configura en `.env.local` las siguientes claves:

```env
# URL base de la aplicación
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (Públicas por diseño - seguras gracias a RLS)
NEXT_PUBLIC_SUPABASE_URL=https://<TU-PROYECTO>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Supabase Service Role (SOLO SERVIDOR - NUNCA en el cliente)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Cloudflare Turnstile (Anti-Bot)
# Para pruebas locales puedes usar las claves oficiales de prueba de Cloudflare:
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Upstash Redis (Rate Limiting en servidor)
# Obligatorio en producción para mitigar spam/DDoS.
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# Política de Seguridad de Contenido (CSP)
# 'false' para modo Report-Only durante desarrollo; 'true' para modo bloqueo en producción.
CSP_ENFORCE=false
```

---

## 🗄️ Base de Datos y Seguridad (Supabase)

### Migraciones Incluidas
Las migraciones se encuentran en `supabase/migrations/`:
1. `0001_helpers.sql`: Funciones auxiliares (`set_updated_at`).
2. `0002_tablas.sql`: Definición de tablas (`profiles`, `sedes`, `categories`, `products`, `product_prices`, `promotions`, `site_settings`, `audit_log`).
3. `0003_funciones_y_triggers.sql`: Función de seguridad `is_admin()` (`SECURITY DEFINER` con `search_path = ''`) y disparador inmutable de auditoría `audit_row()`.
4. `0004_rls_y_permisos.sql`: Activación de RLS en el 100% de tablas. Revocación de permisos genéricos y concesión estricta de mínimo privilegio.
5. `0005_storage.sql`: Bucket `product-images` (2 MB, JPEG/PNG/WebP, lectura pública, subida y edición exclusiva para admins).
6. `0006_click_stats.sql`: Tabla y RPC `increment_click` para métricas anónimas por sede sin capturar IPs.

### Ejecución de Pruebas de Seguridad RLS
Para comprobar que usuarios anónimos o no autorizados **no puedan escribir ni modificar nada**, ejecuta el contenido de `supabase/tests/rls_verification.sql` en el SQL Editor de tu panel de Supabase. Todo el test corre en una transacción con `ROLLBACK`, reportando `OK` en cada regla validada.

---

## 📱 Motor de Pedidos por WhatsApp

El sitio **no requiere pasarela de pagos**. El proceso de compra opera de forma transparente:

1. El usuario selecciona su sede (**Belén** o **Ambalá**) o la web lo asiste de acuerdo a su preferencia.
2. Agrega ítems a su pedido (estado gestionado de forma reactiva en el cliente).
3. Selecciona la modalidad: *"Consumir en el local"*, *"Recoger"* o *"Domicilio"*.
4. Al presionar *"Enviar por WhatsApp"*, la Server Action `createWhatsAppOrder`:
   - Verifica el token de Turnstile y el límite de tasa de peticiones (Rate Limit).
   - Lee los precios vigentes en `product_prices` para esa sede específica.
   - Si un producto no tiene precio asignado, marca `hasUnpriced = true` e indica *"Consultar precio"*.
   - Suma el subtotal referencial.
   - Genera el mensaje estructurado con un aviso explícito de que el total es referencial y que la sede confirmará stock, costo de envío y medios de pago.
   - Devuelve la URL sanitizada y codificada `https://wa.me/573017430183?text=...`.

---

## 🛠️ Guía de Uso del Panel de Administración

El panel está concebido para ser operado fácilmente por cualquier persona sin conocimientos de programación:

1. **Acceso al Panel:**
   - Ingresa a `/admin/login`.
   - Introduce tus credenciales creadas en Supabase Auth.
   - Si tienes activado el segundo factor (2FA), introduce el código de 6 dígitos de tu aplicación autenticadora (Google Authenticator, Authy, etc.) en `/admin/verificar`.

2. **Gestión de Productos (`/admin/productos`):**
   - **Activar / Desactivar:** Puedes ocultar un producto de toda la web con un solo clic.
   - **Agotado por Sede:** Dentro de cada producto, puedes marcar un ítem como agotado en *Belén* sin que afecte a *Ambalá*, o viceversa.
   - **Precios por Sede:** Puedes definir un precio distinto para cada sede. Si dejas el campo vacío, la web mostrará automáticamente *"Consultar precio"*.
   - **Subir Fotografía:** Selecciona una imagen desde tu dispositivo. El sistema verifica automáticamente que sea una foto auténtica (JPEG, PNG o WebP) y que pese menos de 2 MB, optimizándola para entrega rápida.

3. **Producto del Momento (`/admin/ajustes`):**
   - Selecciona qué producto del catálogo aparecerá destacado en la portada principal como recomendación estrella.

4. **Banners y Promociones (`/admin/promociones`):**
   - Publica anuncios temporales (ej. *"2x1 en waffles los jueves"*). Solo se mostrarán durante el rango de fechas que configures.

5. **Horarios y WhatsApp de Sedes (`/admin/sedes`):**
   - Si cambia la línea telefónica o el número de WhatsApp de una sede, modifícalo aquí sin tocar código. Si una sede aún no tiene WhatsApp (como Ambalá), déjalo vacío y la web mostrará *"Pronto"*.

6. **Historial de Auditoría (`/admin/historial`):**
   - Consulta el registro cronológico inmutable de todos los cambios realizados en el sistema (quién creó, modificó o borró un registro, con fecha exacta y valores anteriores).

---

## 📍 SEO Local y Datos Estructurados

- **Consistencia NAP:** Nombre, dirección y teléfono alineados con las fichas de Google Maps.
- **Esquema JSON-LD:** Implementado en cada sede como `IceCreamShop` y `Organization` global, enlazando menús independientes, coordenadas y horarios.
- **Cumplimiento de Directrices de Google:** **No se incluye marcado auto-publicado de `AggregateRating`** para proteger el sitio de penalizaciones algorítmicas de Google Search.
- **Sitemap y Robots:** `sitemap.xml` dinámico y `robots.txt` que restringe el indexado en entornos de desarrollo y protege las rutas del panel administrativo.

---

## ☁️ Opciones de Despliegue en Producción

> **Nota sobre Vercel Hobby:** El plan Hobby gratuito de Vercel está restringido por sus Términos de Servicio a proyectos personales o no comerciales. Dado que Heladería Dulce Tentación es un negocio comercial en Colombia, se recomiendan las siguientes alternativas:

1. **Vercel Pro (Recomendado):**
   - Despliegue nativo con un clic conectando el repositorio privado de GitHub.
   - Incluye Vercel Analytics, soporte comercial completo y CDN global ultrarrápida.
2. **Cloudflare Pages / Workers:**
   - Compatible con Next.js mediante OpenNext o Cloudflare adapter.
   - Sin restricciones de uso comercial en su capa gratuita/básica.
3. **Contenedor Docker en Servidor Propio (VPS / Railway / Render):**
   - El proyecto cuenta con soporte nativo para `output: "standalone"` en Next.js, permitiendo empaquetar la aplicación en un contenedor Docker ligero con Node.js y ejecutarlo en cualquier proveedor de hosting.

---

## ✅ Checklist de Verificación Manual

Antes del lanzamiento público con el cliente:

- [ ] **Credenciales de Producción:** Configurar `.env.local` de producción con las claves definitivas de Supabase, Upstash Redis y Cloudflare Turnstile.
- [ ] **WhatsApp de Ambalá:** Actualizar el número de la sede Ambalá en `/admin/sedes` una vez sea entregado por el dueño.
- [ ] **Sub-marca Dulce Rosé:** Confirmar con el dueño si desea incluir la sede de *Rincón de Piedra Pintada* (`Cra 7C # 51-02`).
- [ ] **Fotografías Originales:** Reemplazar las imágenes provisionales por las fotografías en alta resolución del local, logo y productos entregadas por el propietario.
- [ ] **Activación de Bloqueo CSP:** Cambiar `CSP_ENFORCE=true` en las variables de entorno de producción una vez validado que no existan avisos en la consola del navegador.
- [ ] **Verificación de 2FA:** Comprobar el enrolamiento del segundo factor en la cuenta del administrador antes de entregar accesos.
