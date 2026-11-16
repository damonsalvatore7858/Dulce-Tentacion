import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
  return { title: dict.sedes.title, description: dict.sedes.intro, alternates: pageAlternates(lang, "/sedes") };
}

export default async function SedesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const sedes = await getSedes();

  return (
    <>
      <PageHeader title={dict.sedes.title} intro={dict.sedes.intro} />
      <div className="page-container pb-16">
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
      </div>
    </>
  );
}
