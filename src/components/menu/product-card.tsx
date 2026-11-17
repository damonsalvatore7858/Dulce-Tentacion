import Image from "next/image";
import type { ReactNode } from "react";
import { IceCream, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/menu/price";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  description?: string | null;
  priceCop: number | null;
  available: boolean;
  imageUrl?: string | null;
  imageAlt?: string;
  isExample?: boolean;
  highlighted?: boolean;
  labels: { consultPrice: string; soldOut: string; example: string };
  footer?: ReactNode;
  className?: string;
};

export function ProductCard({
  name,
  description,
  priceCop,
  available,
  imageUrl,
  imageAlt,
  isExample = false,
  highlighted = false,
  labels,
  footer,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-primary/30",
        highlighted && "border-primary/40 ring-2 ring-primary/20",
        !available && "opacity-80",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-linear-to-br from-brand-pastel/40 via-muted/60 to-accent/15">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div aria-hidden="true" className="relative flex h-full w-full flex-col items-center justify-center p-6 text-primary/70">
            <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-brand-pink/20 blur-xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full bg-brand-blue/20 blur-xl" />
            <div className="flex size-16 items-center justify-center rounded-full bg-card/80 shadow-xs ring-1 ring-border/60 transition-transform duration-300 group-hover:scale-110">
              <IceCream className="size-8 text-primary" />
            </div>
            <span className="mt-2.5 inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground/80">
              <Sparkles className="size-3 text-accent" />
              Artesanal &middot; Ibagué
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {highlighted ? (
            <Badge variant="accent" className="shadow-xs font-bold">
              ★ Destacado
            </Badge>
          ) : null}
          {isExample ? <Badge variant="example" className="bg-card">{labels.example}</Badge> : null}
          {!available ? <Badge variant="primary">{labels.soldOut}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h3 className="font-display text-xl sm:text-2xl leading-snug text-foreground transition-colors group-hover:text-primary">
          {name}
        </h3>
        {description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40">
          <Price value={priceCop} consultLabel={labels.consultPrice} muted={!available} />
        </div>
        {footer ? <div className="pt-2">{footer}</div> : null}
      </div>
    </Card>
  );
}
