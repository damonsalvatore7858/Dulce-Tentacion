import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { SedeActions } from "@/components/sedes/sede-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Sede } from "@/lib/data/types";
import { pick } from "@/lib/i18n-text";

type Props = { lang: Locale; sede: Sede; dict: Dictionary; withActions?: boolean };

export function SedeCard({ lang, sede, dict, withActions = true }: Props) {
  const note = sede.horario_nota ? pick(lang, sede.horario_nota, sede.horario_nota_en) : null;

  return (
    <Card className="flex h-full flex-col gap-4 rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-2xl text-primary">{sede.nombre}</h3>
        {sede.domicilios ? (
          <span className="shrink-0 rounded-pill bg-brand-pastel/60 px-2.5 py-1 text-[0.7rem] font-bold text-primary">
            Domicilios
          </span>
        ) : null}
      </div>
      <address className="flex gap-2.5 not-italic text-sm sm:text-base text-muted-foreground">
        <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span className="leading-snug">
          {sede.direccion}
          {sede.barrio ? `, ${sede.barrio}` : ""}, {sede.ciudad}
        </span>
      </address>
      {note ? (
        <p className="flex gap-2.5 text-xs sm:text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{note}</span>
        </p>
      ) : null}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        <div className="flex flex-wrap gap-2">
          <Button asChild size="default" className="shadow-xs font-bold">
            <Link href={href(lang, `/carta/${sede.slug}`)}>{dict.common.seeMenu}</Link>
          </Button>
          <Button asChild variant="outline" size="default" className="font-semibold">
            <Link href={href(lang, `/sedes/${sede.slug}`)}>{dict.common.seeSede}</Link>
          </Button>
        </div>
        {withActions ? <SedeActions sede={sede} dict={dict} /> : null}
      </div>
    </Card>
  );
}
