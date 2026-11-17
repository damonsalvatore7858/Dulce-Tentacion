import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Nunito, Pacifico } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartBar } from "@/components/order/cart-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings, parseModulos } from "@/lib/data/queries";
import { isProductionDeploy } from "@/lib/security/env";
import { SITE_URL } from "@/lib/site";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

type LangParams = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${dict.meta.siteName} | ${dict.meta.tagline}`,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    applicationName: dict.meta.siteName,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png" }],
    },
    robots: isProductionDeploy ? undefined : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: lang === "es" ? "es_CO" : "en_US",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
  params,
}: LangParams & { children: ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, settings] = await Promise.all([
    getDictionary(lang),
    getSettings(),
  ]);
  const modulos = parseModulos(settings);
  const showEventos = Boolean(modulos.eventos || modulos.reservas);

  return (
    <html
      lang={lang === "es" ? "es-CO" : "en"}
      className={`${nunito.variable} ${pacifico.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="system"){document.documentElement.setAttribute("data-theme",t);}else{document.documentElement.setAttribute("data-theme","light");}}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-primary focus:px-5 focus:py-3 focus:font-bold focus:text-primary-foreground"
        >
          {dict.a11y.skipToContent}
        </a>
        <SiteHeader
          lang={lang}
          dict={{
            meta: dict.meta,
            nav: dict.nav,
            a11y: dict.a11y,
            theme: dict.theme,
            language: dict.language,
          }}
          showEventos={showEventos}
        />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter lang={lang} dict={dict} />
        <CartBar lang={lang} dict={dict.order} />
        <Analytics />
      </body>
    </html>
  );
}
