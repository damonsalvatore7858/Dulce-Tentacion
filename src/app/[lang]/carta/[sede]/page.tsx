import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/menu/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AddToCart } from "@/components/order/add-to-cart";
import { WhatsAppFab } from "@/components/order/whatsapp-fab";
import { SedeActions } from "@/components/sedes/sede-actions";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCatalogo, getSedeBySlug, getSedes, publicImageUrl } from "@/lib/data/queries";
import { pick } from "@/lib/i18n-text";
import { pageAlternates } from "@/lib/seo/alternates";
import { validWhatsapp } from "@/lib/sede-links";
import { slugSchema } from "@/lib/validation/params";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; sede: string }> };

export async function generateStaticParams() {
  const sedes = await getSedes();
  return (sedes ?? []).map((sede) => ({ sede: sede.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, sede: slug } = await params;
  const parsed = slugSchema.safeParse(slug);
  if (!isLocale(lang) || !parsed.success) return {};
  const sede = await getSedeBySlug(parsed.data);
  if (!sede) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.carta.title} - ${sede.nombre}`,
    description: dict.carta.note,
    alternates: pageAlternates(lang, `/carta/${sede.slug}`),
  };
}

export default async function CartaSedePage({ params }: Props) {
  const { lang, sede: slug } = await params;
  if (!isLocale(lang)) notFound();
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) notFound();

  const sede = await getSedeBySlug(parsed.data);
  if (!sede) notFound();

  const dict = getDictionary(lang);
  const catalogo = await getCatalogo(sede.id);
  const labels = {
    consultPrice: dict.common.consultPrice,
    soldOut: dict.common.soldOut,
    example: dict.common.example,
  };

  const canOrder = validWhatsapp(sede.whatsapp) !== null;
  const addLabels = {
    add: dict.order.add,
    inc: dict.order.inc,
    dec: dict.order.dec,
    replaced: dict.order.replaced,
    limit: dict.order.limit,
  };

  const groups = catalogo
    ? catalogo.categories
        .map((category) => ({
          category,
          items: catalogo.items.filter((item) => item.category_id === category.id),
        }))
        .filter((group) => group.items.length > 0)
    : [];

  return (
    <>
      <WhatsAppFab sede={sede} label={dict.common.whatsapp} />
      <PageHeader title={`${dict.carta.title} - ${sede.nombre}`} intro={dict.carta.note} />
      <div className="page-container flex flex-col gap-8 pb-16">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={href(lang, "/carta")}
            className="font-bold text-primary underline-offset-4 hover:underline"
          >
            {dict.carta.changeSede}
          </Link>
        </div>
        <SedeActions sede={sede} dict={dict} />
        {!canOrder ? (
          <p role="status" className="rounded-field bg-muted px-4 py-3 font-bold">
            {dict.order.soonSede}
          </p>
        ) : null}

        {catalogo === null ? (
          <EmptyState tone="error" message={dict.common.unavailable} />
        ) : groups.length === 0 ? (
          <EmptyState message={dict.common.empty} />
        ) : (
          <>
            <nav
              aria-label={dict.carta.categories}
              className="sticky top-16 z-20 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-md border-y border-border/80 shadow-xs sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none sm:shadow-none"
            >
              <ul className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar sm:flex-wrap">
                {groups.map(({ category }) => (
                  <li key={category.id} className="shrink-0">
                    <a
                      href={`#cat-${category.slug}`}
                      className="inline-flex min-h-10 sm:min-h-11 items-center whitespace-nowrap rounded-pill bg-muted/80 px-4 text-xs sm:text-sm font-bold text-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95 shadow-2xs"
                    >
                      {pick(lang, category.nombre, category.nombre_en)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {groups.map(({ category, items }) => (
              <section key={category.id} id={`cat-${category.slug}`} className="flex scroll-mt-24 flex-col gap-4">
                <h2 className="font-display text-3xl text-primary">
                  {pick(lang, category.nombre, category.nombre_en)}
                </h2>
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <ProductCard
                        name={pick(lang, item.nombre, item.nombre_en)}
                        description={item.descripcion ? pick(lang, item.descripcion, item.descripcion_en) : null}
                        priceCop={item.precio_cop}
                        available={item.disponible}
                        imageUrl={publicImageUrl(item.image_path)}
                        isExample={item.es_ejemplo}
                        highlighted={item.destacado}
                        labels={labels}
                        className="h-full"
                        footer={
                          canOrder && item.disponible ? (
                            <AddToCart
                              sedeSlug={sede.slug}
                              sedeName={sede.nombre}
                              productId={item.id}
                              name={pick(lang, item.nombre, item.nombre_en)}
                              labels={addLabels}
                            />
                          ) : null
                        }
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
