import type { MetadataRoute } from "next";
import { getSedes } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo/json-ld";

const STATIC_PATHS = ["/", "/carta", "/sedes", "/como-pedir", "/eventos", "/nosotros", "/contacto", "/privacidad", "/terminos", "/cookies"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sedes = (await getSedes()) ?? [];
  const paths = [...STATIC_PATHS, ...sedes.flatMap((sede) => [`/sedes/${sede.slug}`, `/carta/${sede.slug}`])];

  return paths.map((path) => ({
    url: absoluteUrl("es", path),
    changeFrequency: path.startsWith("/carta") || path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/carta") || path.startsWith("/sedes") ? 0.8 : 0.5,
    alternates: {
      languages: { "es-CO": absoluteUrl("es", path), en: absoluteUrl("en", path) },
    },
  }));
}
