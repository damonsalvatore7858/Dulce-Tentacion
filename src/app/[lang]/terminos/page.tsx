import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/shared/legal-page";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo/alternates";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDictionary(lang).legal.terms.title,
    alternates: pageAlternates(lang, "/terminos"),
  };
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const content = getDictionary(lang).legal.terms;
  return <LegalPage title={content.title} sections={content.sections} />;
}
