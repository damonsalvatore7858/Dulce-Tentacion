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

// Una entidad IceCreamShop por sede. SIN AggregateRating propio (Google lo penaliza).
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
    name: sede.nombre,
    url: absoluteUrl(lang, `/sedes/${sede.slug}`),
    hasMenu: absoluteUrl(lang, `/carta/${sede.slug}`),
    parentOrganization: { "@type": "Organization", name: ORG_NAME, url: absoluteUrl(lang, "/") },
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

// JSON seguro para incrustar en <script>: escapa "<" y los separadores de línea unicode,
// así un nombre editable nunca puede cerrar la etiqueta ni inyectar HTML.
export function safeJsonForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
