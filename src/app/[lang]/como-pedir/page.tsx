import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo/alternates";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return { title: dict.comoPedir.title, description: dict.comoPedir.intro, alternates: pageAlternates(lang, "/como-pedir") };
}

export default async function ComoPedirPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { comoPedir, home } = getDictionary(lang);

  return (
    <>
      <PageHeader title={comoPedir.title} intro={comoPedir.intro} />
      <div className="page-container flex flex-col gap-10 pb-16">
        <ol className="grid gap-4 sm:grid-cols-2">
          {comoPedir.steps.map((step, index) => (
            <li key={step.t}>
              <Card className="flex h-full gap-4 p-5">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-primary font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-display text-xl">{step.t}</h2>
                  <p className="text-muted-foreground">{step.d}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-3xl text-primary">{comoPedir.deliveryTitle}</h2>
          <p className="max-w-2xl text-muted-foreground">{comoPedir.deliveryText}</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-3xl text-primary">{comoPedir.paymentsTitle}</h2>
          <p className="max-w-2xl text-muted-foreground">{comoPedir.paymentsText}</p>
        </section>

        <Button asChild size="lg" className="self-start">
          <Link href={href(lang, "/carta")}>{home.ctaMenu}</Link>
        </Button>
      </div>
    </>
  );
}
