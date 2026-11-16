import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { MomentCard } from "@/components/menu/moment-card";
import { JsonLd } from "@/components/seo/json-ld";
import { EmptyState } from "@/components/shared/empty-state";
import { Faq } from "@/components/shared/faq";
import { SedeCard } from "@/components/sedes/sede-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getCategorias,
  getMomento,
  getPromociones,
  getSedes,
  getSettings,
  parseBanner,
} from "@/lib/data/queries";
import { pick } from "@/lib/i18n-text";
import { pageAlternates } from "@/lib/seo/alternates";
import { organizationJsonLd } from "@/lib/seo/json-ld";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: pageAlternates(lang, "/") };
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-3xl text-primary sm:text-4xl">{children}</h2>;
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const [sedes, categorias, promos, settings] = await Promise.all([
    getSedes(),
    getCategorias(),
    getPromociones(),
    getSettings(),
  ]);
  const banner = parseBanner(settings);
  const moment = await getMomento(settings);
  const bannerText = lang === "en" ? banner.texto_en || banner.texto_es : banner.texto_es;

  return (
    <>
      <JsonLd data={organizationJsonLd(lang)} />
      {banner.activo && bannerText ? (
        <div className="bg-accent px-4 py-2 text-center text-sm font-bold text-accent-foreground">
          {bannerText}
        </div>
      ) : null}

      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-pink/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="page-container section-y relative flex flex-col items-center gap-6 text-center">
          <Badge variant="accent">{dict.home.eyebrow}</Badge>
          <h1 className="font-display text-5xl leading-tight text-primary text-neon sm:text-6xl">
            {dict.home.title}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{dict.home.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={href(lang, "/carta")}>{dict.home.ctaMenu}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={href(lang, "/sedes")}>{dict.home.ctaSedes}</Link>
            </Button>
          </div>
          <p className="font-display text-2xl">{dict.home.slogan2}</p>
        </div>
      </section>

      {moment && sedes ? (
        <section className="page-container flex flex-col gap-6 pb-12">
          <SectionTitle>{dict.home.momentTitle}</SectionTitle>
          <MomentCard lang={lang} moment={moment} sedes={sedes} dict={dict} />
        </section>
      ) : null}

      {promos.length > 0 ? (
        <section className="page-container flex flex-col gap-6 pb-12">
          <SectionTitle>{dict.home.promosTitle}</SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2">
            {promos.map((promo) => (
              <li key={promo.id}>
                <Card className="h-full p-5">
                  <h3 className="font-display text-xl">{pick(lang, promo.titulo, promo.titulo_en)}</h3>
                  {promo.texto ? (
                    <p className="pt-1 text-muted-foreground">{pick(lang, promo.texto, promo.texto_en)}</p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {categorias && categorias.length > 0 ? (
        <section className="page-container flex flex-col gap-6 pb-12">
          <SectionTitle>{dict.home.categoriesTitle}</SectionTitle>
          <ul className="flex flex-wrap gap-3">
            {categorias.map((cat) => (
              <li key={cat.id}>
                <Button asChild variant="accent" size="lg">
                  <Link href={href(lang, "/carta")}>{pick(lang, cat.nombre, cat.nombre_en)}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="page-container flex flex-col gap-6 pb-12">
        <SectionTitle>{dict.home.sedesTitle}</SectionTitle>
        {sedes === null ? (
          <EmptyState tone="error" message={dict.common.unavailable} />
        ) : sedes.length === 0 ? (
          <EmptyState message={dict.common.empty} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {sedes.map((sede) => (
              <li key={sede.id}>
                <SedeCard lang={lang} sede={sede} dict={dict} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="page-container pb-12">
        <Card className="flex flex-col items-start gap-3 bg-muted p-6 sm:p-8">
          <SectionTitle>{dict.home.deliveryTitle}</SectionTitle>
          <p className="max-w-2xl text-muted-foreground">{dict.home.deliveryText}</p>
          <Button asChild variant="secondary">
            <Link href={href(lang, "/como-pedir")}>
              {dict.home.deliveryCta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      </section>

      <section className="page-container pb-12">
        <Card className="flex flex-col items-start gap-3 p-6 sm:p-8">
          <SectionTitle>{dict.home.instaTitle}</SectionTitle>
          <p className="text-muted-foreground">{dict.home.instaText}</p>
          <Button asChild variant="outline">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              {INSTAGRAM_HANDLE}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </Card>
      </section>

      <section className="page-container flex max-w-3xl flex-col gap-6 pb-12">
        <SectionTitle>{dict.home.faqTitle}</SectionTitle>
        <Faq items={dict.home.faq} />
      </section>

      <section className="page-container section-y flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-4xl text-primary text-neon">{dict.home.finalTitle}</h2>
        <p className="text-lg text-muted-foreground">{dict.home.finalText}</p>
        <Button asChild size="lg">
          <Link href={href(lang, "/carta")}>{dict.home.ctaMenu}</Link>
        </Button>
      </section>
    </>
  );
}
