import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { SedeCard } from "@/components/sedes/sede-card";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSedes } from "@/lib/data/queries";
import { pageAlternates } from "@/lib/seo/alternates";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.carta.title, description: dict.carta.intro, alternates: pageAlternates(lang, "/carta") };
}

export default async function CartaPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const sedes = await getSedes();

  return (
    <>
      <PageHeader title={dict.carta.title} intro={dict.carta.intro} />
      <div className="page-container pb-16">
        <h2 className="pb-4 font-display text-2xl">{dict.carta.chooseSede}</h2>
        {sedes === null ? (
          <EmptyState tone="error" message={dict.common.unavailable} />
        ) : sedes.length === 0 ? (
          <EmptyState message={dict.common.empty} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {sedes.map((sede) => (
              <li key={sede.id}>
                <SedeCard lang={lang} sede={sede} dict={dict} withActions={false} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
