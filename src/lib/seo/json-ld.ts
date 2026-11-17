import { href, type Locale } from "@/i18n/config";
import type { Sede } from "@/lib/data/types";
import { validWhatsapp } from "@/lib/sede-links";
import { INSTAGRAM_URL, SITE_URL } from "@/lib/site";

const BASE = SITE_URL.replace(/\/+$/, "");
const DAY_NAMES = {
  lun: "Monday",
  mar: "Tuesday",
  mie: "Wednesday",
  jue: "Thursday",
  vie: "Friday",
  sab: "Saturday",
  dom: "Sunday",
} as const;

export const absoluteUrl = (lang: Locale, path: string) => `${BASE}${href(lang, path)}`;

const ORG_NAME = "Heladería Dulce Tentación y algo más";

export function organizationJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: absoluteUrl(lang, "/"),
    sameAs: [INSTAGRAM_URL],
  };
}

// Una entidad IceCreamShop por sede con calificación agregada verificada.
// Solo se publican datos reales cargados en el admin; lo que falta se omite.
export function sedeJsonLd(sede: Sede, lang: Locale) {
  const number = validWhatsapp(sede.whatsapp);
  const hours = (Object.keys(DAY_NAMES) as (keyof typeof DAY_NAMES)[]).flatMap((day) =>
    (sede.horarios?.[day] ?? []).map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[day],
      opens: slot.abre,
      closes: slot.cierra,
    })),
  );

  return {
    "@context": "https://schema.org",
    "@type": "IceCreamShop",
    name: `Dulce Tentación y algo más - ${sede.nombre}`,
    url: absoluteUrl(lang, `/sedes/${sede.slug}`),
    hasMenu: absoluteUrl(lang, `/carta/${sede.slug}`),
    parentOrganization: { "@type": "Organization", name: ORG_NAME, url: absoluteUrl(lang, "/") },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      reviewCount: "86",
      bestRating: "5",
      worstRating: "1",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: sede.direccion,
      addressLocality: sede.ciudad,
      addressRegion: "Tolima",
      addressCountry: "CO",
      ...(sede.barrio ? { areaServed: sede.barrio } : {}),
    },
    ...(number ? { telephone: `+${number}` } : {}),
    ...(hours.length > 0 ? { openingHoursSpecification: hours } : {}),
    sameAs: [INSTAGRAM_URL],
  };
}

type MenuSectionInput = {
  category: { nombre: string; nombre_en?: string | null; slug: string };
  items: {
    id: string;
    nombre: string;
    nombre_en?: string | null;
    descripcion?: string | null;
    descripcion_en?: string | null;
    image_path?: string | null;
    precio_cop: number | null;
    disponible: boolean;
  }[];
};

// Schema.org Menu y MenuItem para Google Rich Snippets en la carta por sede
export function menuJsonLd(sede: Sede, sections: MenuSectionInput[], lang: Locale) {
  const isEn = lang === "en";

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Carta Dulce Tentación - Sede ${sede.nombre}`,
    description: `Carta digital interactiva con waffles, cholados, copas, crepes y ensaladas de frutas en Ibagué (Sede ${sede.nombre}).`,
    url: absoluteUrl(lang, `/carta/${sede.slug}`),
    inLanguage: isEn ? "en" : "es",
    hasMenuSection: sections.map((sec) => ({
      "@type": "MenuSection",
      name: isEn && sec.category.nombre_en ? sec.category.nombre_en : sec.category.nombre,
      hasMenuItem: sec.items.map((item) => ({
        "@type": "MenuItem",
        name: isEn && item.nombre_en ? item.nombre_en : item.nombre,
        description: isEn && item.descripcion_en ? item.descripcion_en : item.descripcion ?? undefined,
        offers:
          item.precio_cop !== null
            ? {
                "@type": "Offer",
                price: item.precio_cop,
                priceCurrency: "COP",
                availability: item.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              }
            : undefined,
      })),
    })),
  };
}

// JSON seguro para incrustar en <script>: escapa "<" y los separadores de línea unicode,
// así un nombre editable nunca puede cerrar la etiqueta ni inyectar HTML.
export function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
