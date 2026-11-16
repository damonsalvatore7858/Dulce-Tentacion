import { MessageCircle, Navigation, Phone } from "lucide-react";
import { TrackedLink } from "@/components/order/tracked-link";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Sede } from "@/lib/data/types";
import { directionsUrl, telHref, validWhatsapp, whatsappUrl } from "@/lib/sede-links";

type Props = { sede: Sede; dict: Dictionary };

// WhatsApp (o "Pronto" si la sede aún no tiene número), teléfono y cómo llegar.
export function SedeActions({ sede, dict }: Props) {
  const number = validWhatsapp(sede.whatsapp);

  return (
    <div className="flex flex-wrap gap-2">
      {number ? (
        <Button asChild variant="accent">
          <TrackedLink href={whatsappUrl(number)} target="_blank" rel="noopener noreferrer" sede={sede.slug} canal="whatsapp_sede">
            <MessageCircle aria-hidden="true" />
            {dict.common.whatsapp}
          </TrackedLink>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          {dict.common.whatsappSoon}
        </Button>
      )}
      {sede.telefono ? (
        <Button asChild variant="ghost">
          <a href={telHref(sede.telefono)}>
            <Phone aria-hidden="true" />
            {dict.common.call}
          </a>
        </Button>
      ) : null}
      <Button asChild variant="outline">
        <TrackedLink href={directionsUrl(sede)} target="_blank" rel="noopener noreferrer" sede={sede.slug} canal="como_llegar">
          <Navigation aria-hidden="true" />
          {dict.common.howToGet}
        </TrackedLink>
      </Button>
    </div>
  );
}
