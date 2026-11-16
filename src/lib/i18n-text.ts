import type { Locale } from "@/i18n/config";

// Devuelve el texto en inglés si existe y el idioma es inglés; si no, el de español.
export function pick(lang: Locale, es: string, en: string | null | undefined): string {
  return lang === "en" && en ? en : es;
}
