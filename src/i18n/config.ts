export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Construye una ruta con el idioma: español sin prefijo, inglés con /en.
export function href(lang: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

// Quita el prefijo de idioma de una ruta (/en/carta -> /carta).
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(es|en)(?=\/|$)/);
  if (!match) return pathname || "/";
  return pathname.slice(match[0].length) || "/";
}
