import type { Sede } from "@/lib/data/types";
import { embedUrl } from "@/lib/sede-links";

// Mapa de Google. La URL sale de la BD (restringida por CHECK a google.com/maps) o se arma
// desde la dirección. La CSP de las Fases 7 y 8 debe permitir https://www.google.com en frame-src.
export function MapEmbed({ sede, title }: { sede: Sede; title: string }) {
  return (
    <iframe
      title={title}
      src={embedUrl(sede)}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className="h-80 w-full rounded-card border border-border bg-muted"
    />
  );
}
