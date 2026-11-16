"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, stripLocale, type Locale } from "@/i18n/config";

type Props = {
  lang: Locale;
  labels: { label: string; es: string; en: string };
};

export function LanguageSwitcher({ lang, labels }: Props) {
  const pathname = usePathname();
  const other: Locale = lang === "es" ? "en" : "es";
  const target = href(other, stripLocale(pathname));

  return (
    <Link
      href={target}
      lang={other}
      hrefLang={other}
      aria-label={`${labels.label}: ${labels[other]}`}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-pill px-3 text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 hover:bg-muted"
    >
      {other}
    </Link>
  );
}
