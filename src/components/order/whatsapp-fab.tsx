import { MessageCircle } from "lucide-react";
import { TrackedLink } from "@/components/order/tracked-link";
import type { Sede } from "@/lib/data/types";
import { validWhatsapp, whatsappUrl } from "@/lib/sede-links";

// Botón flotante de WhatsApp de LA sede que se está viendo. Sin número válido, no se muestra.
export function WhatsAppFab({ sede, label }: { sede: Sede; label: string }) {
  const number = validWhatsapp(sede.whatsapp);
  if (!number) return null;

  return (
    <TrackedLink
      href={whatsappUrl(number)}
      target="_blank"
      rel="noopener noreferrer"
      sede={sede.slug}
      canal="whatsapp_fab"
      aria-label={`${label} ${sede.nombre}`}
      className="fixed bottom-22 right-4 sm:bottom-6 sm:right-6 z-20 flex size-14 items-center justify-center rounded-pill bg-accent text-accent-foreground shadow-lift ring-2 ring-background/60 transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <MessageCircle aria-hidden="true" className="size-7" />
    </TrackedLink>
  );
}
