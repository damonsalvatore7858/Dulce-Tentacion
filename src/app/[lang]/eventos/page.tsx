import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { EventForm } from "@/components/order/event-form";
import { PageHeader } from "@/components/shared/page-header";
import { SedeActions } from "@/components/sedes/sede-actions";
import { Card } from "@/components/ui/card";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSedes, getSettings, parseModulos } from "@/lib/data/queries";
import type { EventKind } from "@/lib/order/limits";
import { pageAlternates } from "@/lib/seo/alternates";
import { validWhatsapp } from "@/lib/sede-links";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const settings = await getSettings();
  const modulos = parseModulos(settings);
  if (!modulos.eventos && !modulos.reservas) return {};
  const dict = getDictionary(lang);
  return { title: dict.eventos.title, description: dict.eventos.intro, alternates: pageAlternates(lang, "/eventos") };
}

export default async function EventosPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [sedes, settings] = await Promise.all([getSedes(), getSettings()]);
  const modulos = parseModulos(settings);

  if (!modulos.eventos && !modulos.reservas) notFound();

  const formSedes = (sedes ?? [])
    .filter((sede) => validWhatsapp(sede.whatsapp) !== null)
    .map((sede) => ({ slug: sede.slug, nombre: sede.nombre }));
  const kinds: EventKind[] = [];
  if (modulos.reservas) kinds.push("reserva");
  if (modulos.eventos) kinds.push("evento", "encargo");

  return (
    <>
      <PageHeader title={dict.eventos.title} intro={dict.eventos.intro} />
      <div className="page-container flex flex-col gap-8 pb-16">
        {!modulos.eventos && !modulos.reservas ? (
          <EmptyState message={dict.eventos.soonText} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {modulos.reservas ? (
              <Card className="p-6">
                <h2 className="font-display text-2xl">{dict.eventos.reserveTitle}</h2>
                <p className="pt-1 text-muted-foreground">{dict.eventos.reserveText}</p>
              </Card>
            ) : null}
            {modulos.eventos ? (
              <Card className="p-6">
                <h2 className="font-display text-2xl">{dict.eventos.orderTitle}</h2>
                <p className="pt-1 text-muted-foreground">{dict.eventos.orderText}</p>
              </Card>
            ) : null}
          </div>
        )}

        {kinds.length > 0 ? (
          formSedes.length > 0 ? (
            <EventForm lang={lang} dict={dict.eventForm} errors={dict.order.errors} sedes={formSedes} kinds={kinds} />
          ) : (
            <EmptyState message={dict.eventForm.noSedes} />
          )
        ) : null}

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-3xl text-primary">{dict.eventos.contactSede}</h2>
          {sedes === null ? (
            <EmptyState tone="error" message={dict.common.unavailable} />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {sedes.map((sede) => (
                <li key={sede.id}>
                  <Card className="flex flex-col gap-3 p-5">
                    <h3 className="font-display text-xl">{sede.nombre}</h3>
                    <SedeActions sede={sede} dict={dict} />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
