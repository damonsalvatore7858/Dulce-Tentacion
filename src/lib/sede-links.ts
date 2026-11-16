import type { Sede } from "@/lib/data/types";
import { whatsappSchema } from "@/lib/validation/params";

export function validWhatsapp(number: string | null): string | null {
  if (!number) return null;
  return whatsappSchema.safeParse(number).success ? number : null;
}

// Enlace de contacto simple. El enlace de PEDIDO (con mensaje) se genera en servidor en la Fase 5.
export function whatsappUrl(number: string): string {
  return `https://wa.me/${number}`;
}

function addressQuery(sede: Sede): string {
  return `${sede.direccion}, ${sede.barrio ? `${sede.barrio}, ` : ""}${sede.ciudad}, Colombia`;
}

export function directionsUrl(sede: Sede): string {
  return (
    sede.maps_url ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery(sede))}`
  );
}

export function embedUrl(sede: Sede): string {
  return (
    sede.maps_embed_url ??
    `https://www.google.com/maps?q=${encodeURIComponent(addressQuery(sede))}&output=embed`
  );
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
