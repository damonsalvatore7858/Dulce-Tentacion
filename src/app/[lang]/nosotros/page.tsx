import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo/alternates";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.nosotros.title, description: dict.nosotros.intro, alternates: pageAlternates(lang, "/nosotros") };
}

export default async function NosotrosPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { nosotros, home } = getDictionary(lang);

  return (
    <>
      <PageHeader title={nosotros.title} intro={nosotros.intro} />
      <div className="page-container flex max-w-3xl flex-col gap-6 pb-16">
        <p className="text-lg text-muted-foreground">{nosotros.body}</p>
        <p className="font-display text-3xl text-primary">{home.slogan2}</p>
      </div>
    </>
  );
}
