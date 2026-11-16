import Image from "next/image";
import type { ReactNode } from "react";
import { Heart } from "lucide-react";
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
        "flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift",
        highlighted && "border-2 border-primary",
        !available && "opacity-80",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-linear-to-br from-muted to-accent/30">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div aria-hidden="true" className="flex h-full w-full items-center justify-center text-primary/60">
            <Heart className="size-14" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isExample ? <Badge variant="example" className="bg-card">{labels.example}</Badge> : null}
          {!available ? <Badge variant="primary">{labels.soldOut}</Badge> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-xl leading-snug">{name}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        <div className="mt-auto pt-2">
          <Price value={priceCop} consultLabel={labels.consultPrice} muted={!available} />
        </div>
        {footer ? <div className="pt-2">{footer}</div> : null}
      </div>
    </Card>
  );
}
