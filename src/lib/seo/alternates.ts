import type { Metadata } from "next";
import { href, type Locale } from "@/i18n/config";

// canonical + hreflang por página (metadataBase viene del layout).
export function pageAlternates(lang: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: href(lang, path),
    languages: {
      "es-CO": href("es", path),
      en: href("en", path),
      "x-default": href("es", path),
    },
  };
}
