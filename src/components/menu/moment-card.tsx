import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
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
    <Card className="grid overflow-hidden border-2 border-primary md:grid-cols-2">
      <div className="relative min-h-56 bg-linear-to-br from-muted to-accent/30">
        {image ? (
          <Image src={image} alt={name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div aria-hidden="true" className="flex h-full min-h-56 items-center justify-center text-primary/60">
            <Heart className="size-16" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className="font-display text-3xl leading-snug">{name}</h3>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
        {rows.length > 0 ? (
          allSame ? (
            <Price value={first} consultLabel={dict.common.consultPrice} className="text-3xl" />
          ) : (
            <ul className="flex flex-col gap-1">
              {rows.map(({ sede, price }) => (
                <li key={sede.id} className="flex items-baseline gap-2">
                  <span className="font-bold">{sede.nombre}:</span>
                  <Price value={price?.precio_cop ?? null} consultLabel={dict.common.consultPrice} />
                </li>
              ))}
            </ul>
          )
        ) : null}
        <div className="mt-auto pt-2">
          <Button asChild>
            <Link href={href(lang, "/carta")}>{dict.home.momentCta}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
