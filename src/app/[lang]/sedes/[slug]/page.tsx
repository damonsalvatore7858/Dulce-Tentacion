import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { WhatsAppFab } from "@/components/order/whatsapp-fab";
import { JsonLd } from "@/components/seo/json-ld";
import { MapEmbed } from "@/components/sedes/map-embed";
import { SedeActions } from "@/components/sedes/sede-actions";
import { SedeHours } from "@/components/sedes/sede-hours";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSedeBySlug, getSedes } from "@/lib/data/queries";
import { pick } from "@/lib/i18n-text";
import { pageAlternates } from "@/lib/seo/alternates";
import { sedeJsonLd } from "@/lib/seo/json-ld";
import { slugSchema } from "@/lib/validation/params";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const sedes = await getSedes();
  return (sedes ?? []).map((sede) => ({ slug: sede.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  if (!isLocale(lang) || !parsed.success) return {};
  const sede = await getSedeBySlug(parsed.data);
  if (!sede) return {};
  return {
    title: sede.nombre,
    description: `${sede.direccion}${sede.barrio ? `, ${sede.barrio}` : ""}, ${sede.ciudad}`,
    alternates: pageAlternates(lang, `/sedes/${sede.slug}`),
  };
}

export default async function SedePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) notFound();

  const sede = await getSedeBySlug(parsed.data);
  if (!sede) notFound();

  const dict = getDictionary(lang);
  const note = sede.horario_nota ? pick(lang, sede.horario_nota, sede.horario_nota_en) : null;

  return (
    <>
      <JsonLd data={sedeJsonLd(sede, lang)} />
      <WhatsAppFab sede={sede} label={dict.common.whatsapp} />
      <PageHeader title={sede.nombre} />
      <div className="page-container flex flex-col gap-8 pb-16">
        <address className="flex gap-2 text-lg not-italic">
          <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
          <span>
            {sede.direccion}
            {sede.barrio ? `, ${sede.barrio}` : ""}, {sede.ciudad}
          </span>
        </address>
        {note ? <p className="text-muted-foreground">{note}</p> : null}
        {sede.domicilios ? <p className="font-bold">{dict.sedes.delivery}</p> : null}

        <SedeActions sede={sede} dict={dict} />
        <SedeHours sede={sede} dict={dict} />

        <Button asChild size="lg" className="self-start">
          <Link href={href(lang, `/carta/${sede.slug}`)}>{dict.common.seeMenu}</Link>
        </Button>

        <MapEmbed sede={sede} title={`${dict.sedes.mapTitle}: ${sede.nombre}`} />
      </div>
    </>
  );
}
