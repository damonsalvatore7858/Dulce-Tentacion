"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
  lang: Locale;
  dict: Pick<Dictionary, "meta" | "nav" | "a11y" | "theme" | "language">;
  showEventos?: boolean;
};

const NAV_ITEMS: { key: keyof Dictionary["nav"]; path: string }[] = [
  { key: "carta", path: "/carta" },
  { key: "sedes", path: "/sedes" },
  { key: "comoPedir", path: "/como-pedir" },
  { key: "eventos", path: "/eventos" },
  { key: "nosotros", path: "/nosotros" },
  { key: "contacto", path: "/contacto" },
];

export function SiteHeader({ lang, dict, showEventos = true }: Props) {
  const [open, setOpen] = useState(false);
  const navItems = NAV_ITEMS.filter((item) => item.key !== "eventos" || showEventos);

  // Cierra el menú móvil con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-3">
        <Link href={href(lang, "/")} aria-label={dict.meta.siteName} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav aria-label={dict.a11y.mainNav} className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={href(lang, item.path)}
              className="rounded-pill px-4 py-2 text-sm font-bold text-foreground transition-colors duration-200 hover:bg-muted"
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher lang={lang} labels={dict.language} />
          <ThemeToggle labels={dict.theme} />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <nav
        id="menu-movil"
        aria-label={dict.a11y.mainNav}
        hidden={!open}
        className="border-t border-border bg-background lg:hidden"
      >
        <ul className="page-container flex flex-col py-2">
          {navItems.map((item) => (
            <li key={item.key}>
              <Link
                href={href(lang, item.path)}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-field px-3 text-lg font-bold text-foreground hover:bg-muted"
              >
                {dict.nav[item.key]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
