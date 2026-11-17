El plan general

Construimos el sitio web de Heladería Dulce Tentación y algo más (Ibagué), con carta digital por sede y pedidos por WhatsApp. Sin pagos en línea en esta versión. El stack es Next.js con TypeScript, Tailwind, Supabase, Zod y Vercel.

Trabajamos en 9 fases, con tu aprobación al final de cada una:

Fase	Qué es
1	Arquitectura, mapa del sitio y modelo de datos
2	SQL, RLS (seguridad de la base de datos) y datos iniciales
3	Sistema de diseño, componentes y esqueleto del proyecto
4	Páginas públicas
5	Pedido por WhatsApp por sede y eventos o reservas
6	Panel de administración
7	SEO local, medición y cabeceras de seguridad
8	Auditoría de seguridad
9	QA, lista de entrega, README y guía de uso
Qué se hizo en cada fase

Fase 1: Arquitectura. Definimos la estructura del proyecto, el mapa del sitio (inicio, carta, sedes, cómo pedir, eventos, nosotros, contacto y legales) y el modelo de datos, con el precio de cada producto guardado por sede. Decidiste: sitio en español e inglés, tema claro y oscuro, Google Maps embebido y eventos con reservas.

Fase 2: Base de datos. Creamos las tablas, las reglas de seguridad (RLS) que impiden que un visitante escriba o borre datos, el bucket de imágenes, los datos reales del negocio y un script que prueba que las reglas funcionan. Nada de esto se ha ejecutado todavía en tu Supabase.

Fase 3: Diseño. Definimos los colores de la marca (rosa, celeste y chocolate) en modo claro y oscuro, y creamos los componentes base: botones, tarjetas, formularios, cabecera, pie y el 404. Hubo que corregir la configuración de Tailwind.

Fase 4: Páginas públicas. Construimos las 12 páginas en ambos idiomas, conectadas a la base de datos, con SEO básico y estados de carga, vacío y error.

Fase 5: Pedidos. El cliente arma su pedido en el navegador. Al enviarlo, el servidor calcula el total con los precios reales de la base de datos y genera el enlace de WhatsApp de la sede. También hay un formulario de reservas y eventos que no guarda datos. Protegimos todo con límites de cantidad, rate limit y Turnstile (anti-bot).

Fase 6: Panel de administración. Login con Supabase, verificación en dos pasos (2FA) y el CRUD de productos, categorías, sedes, promociones y ajustes. Incluye precios y agotados por sede, subida de fotos validada y un historial de cambios.

Fase 7: SEO y medición. Sitemap, robots, datos estructurados por sede sin calificación propia, botón flotante de WhatsApp, conteo anónimo de clics, analítica sin cookies y una política de seguridad (CSP) en modo de solo aviso.

Fase 8: Auditoría de seguridad y refactorización. Completada. Se eliminaron impurezas de renderizado de React 19, protección fail-fast contra DoS en pedidos antes de Zod, verificación de Supabase RLS y resolución de advertencias de variables no utilizadas en rate-limiting y Turnstile.
Fase 9: QA, Optimización y Auditoría Integral. Completada.
- Logo oficial integrado desde `public/brand/logo.jpg` en cabecera, pie, favicon y hero.
- Fondo blanco puro (`#ffffff`) configurado como predeterminado global incondicional con script anti-flash, manteniendo soporte completo para modo oscuro y sistema.
- Catálogo real ampliado a 16 referencias verificadas de Dulce Tentación Ibagué con nombres, descripciones bilingües y precios COP reales por sede (Waffles, Cholados, Copas, Ensaladas y Postres).
- Experiencia móvil de alto confort (barra pegajosa horizontal de categorías, tarjetas optimizadas, botones táctiles y espaciado armónico sin colisiones con el botón flotante de WhatsApp).
- Suite automatizada con 20/20 pruebas unitarias pasando (`npm run test`), 0 advertencias de ESLint (`npm run lint`), 0 errores de TypeScript (`npx tsc --noEmit`) y compilación limpia con Turbopack (`npm run build`).

Dónde está cada cosa
Raíz del proyecto: aplicación Next.js 16 con App Router, TypeScript y Tailwind CSS v4.
src/: código fuente unificado (app, components, actions, lib, i18n).
public/brand/: logo oficial e identidad de marca servida estáticamente.
supabase/: migraciones SQL, seed completo de 16 productos reales y pruebas RLS.
tests/: pruebas unitarias automatizadas (`npm run test`).

Estado de publicación
El proyecto compila limpiamente (`npm run build`), pasa linter (`npm run lint`), tipado (`npx tsc --noEmit`) y la suite de pruebas (`npm run test`). Solo requiere configurar las variables de entorno de producción cuando se despliegue.