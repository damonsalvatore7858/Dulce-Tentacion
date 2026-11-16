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
    <Card className="flex h-full flex-col gap-4 p-6">
      <h3 className="font-display text-2xl text-primary">{sede.nombre}</h3>
      <address className="flex gap-2 not-italic text-muted-foreground">
        <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span>
          {sede.direccion}
          {sede.barrio ? `, ${sede.barrio}` : ""}, {sede.ciudad}
        </span>
      </address>
      {note ? (
        <p className="flex gap-2 text-sm text-muted-foreground">
          <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          {note}
        </p>
      ) : null}
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={href(lang, `/carta/${sede.slug}`)}>{dict.common.seeMenu}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={href(lang, `/sedes/${sede.slug}`)}>{dict.common.seeSede}</Link>
          </Button>
        </div>
        {withActions ? <SedeActions sede={sede} dict={dict} /> : null}
      </div>
    </Card>
  );
}
