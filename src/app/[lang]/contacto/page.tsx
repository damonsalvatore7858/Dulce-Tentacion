import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SedeCard } from "@/components/sedes/sede-card";
import { Button } from "@/components/ui/button";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSedes } from "@/lib/data/queries";
import { pageAlternates } from "@/lib/seo/alternates";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.contacto.title, description: dict.contacto.intro, alternates: pageAlternates(lang, "/contacto") };
}

export default async function ContactoPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const sedes = await getSedes();

  return (
    <>
      <PageHeader title={dict.contacto.title} intro={dict.contacto.intro} />
      <div className="page-container flex flex-col gap-10 pb-16">
        {sedes === null ? (
          <EmptyState tone="error" message={dict.common.unavailable} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {sedes.map((sede) => (
              <li key={sede.id}>
                <SedeCard lang={lang} sede={sede} dict={dict} />
              </li>
            ))}
          </ul>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-3xl text-primary">{dict.contacto.social}</h2>
          <Button asChild variant="outline" className="self-start">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              Instagram {INSTAGRAM_HANDLE}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </section>
      </div>
    </>
  );
}
