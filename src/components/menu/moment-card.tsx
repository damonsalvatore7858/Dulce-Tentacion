import Image from "next/image";
import Link from "next/link";
import { IceCream, Sparkles } from "lucide-react";
import { Price } from "@/components/menu/price";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Moment, Sede } from "@/lib/data/types";
import { publicImageUrl } from "@/lib/data/queries";
import { pick } from "@/lib/i18n-text";

type Props = { lang: Locale; moment: Moment; sedes: Sede[]; dict: Dictionary };

export function MomentCard({ lang, moment, sedes, dict }: Props) {
  const name = pick(lang, moment.nombre, moment.nombre_en);
  const description = moment.descripcion
    ? pick(lang, moment.descripcion, moment.descripcion_en)
    : null;
  const image = publicImageUrl(moment.image_path);

  const rows = sedes
    .map((sede) => ({ sede, price: moment.precios.find((p) => p.sede_id === sede.id) }))
    .filter((row) => row.price && row.price.disponible);
  const first = rows[0]?.price?.precio_cop ?? null;
  const allSame = rows.length > 0 && rows.every((row) => row.price?.precio_cop === first);

  return (
    <Card className="grid overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-primary/40 bg-card shadow-soft md:grid-cols-2">
      <div className="relative min-h-64 sm:min-h-72 w-full overflow-hidden bg-linear-to-br from-brand-pastel/50 via-muted to-accent/20">
        {image ? (
          <Image src={image} alt={name} fill sizes="(min-width: 768px) 50vw, 100vw" quality={85} className="object-cover" />
        ) : (
          <div aria-hidden="true" className="relative flex h-full min-h-64 sm:min-h-72 w-full flex-col items-center justify-center p-6 text-primary">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand-pink/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-brand-blue/20 blur-2xl" />
            <div className="flex size-20 items-center justify-center rounded-full bg-card shadow-sm ring-2 ring-primary/20">
              <IceCream className="size-10 text-primary" />
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3.5 text-accent" />
              Especialidad de la casa
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3.5 p-6 sm:p-8">
        <span className="inline-flex w-fit items-center rounded-pill bg-brand-pastel/80 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
          ✨ {dict.home.momentTitle}
        </span>
        <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-tight text-foreground">{name}</h3>
        {description ? <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">{description}</p> : null}
        {rows.length > 0 ? (
          allSame ? (
            <div className="pt-2">
              <Price value={first} consultLabel={dict.common.consultPrice} className="text-3xl font-extrabold text-primary" />
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5 pt-2">
              {rows.map(({ sede, price }) => (
                <li key={sede.id} className="flex items-baseline gap-2 text-sm sm:text-base">
                  <span className="font-bold text-foreground">{sede.nombre}:</span>
                  <Price value={price?.precio_cop ?? null} consultLabel={dict.common.consultPrice} />
                </li>
              ))}
            </ul>
          )
        ) : null}
        <div className="mt-auto pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto font-bold shadow-xs">
            <Link href={href(lang, "/carta")}>{dict.home.momentCta}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
