import type { MetadataRoute } from "next";
import { getSedes, getSettings, parseModulos } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo/json-ld";

const STATIC_PATHS = ["/", "/carta", "/sedes", "/como-pedir", "/nosotros", "/contacto", "/privacidad", "/terminos", "/cookies"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sedes, settings] = await Promise.all([getSedes(), getSettings()]);
  const modulos = parseModulos(settings);
  const showEventos = Boolean(modulos.eventos || modulos.reservas);

  const basePaths = showEventos ? ["/eventos", ...STATIC_PATHS] : STATIC_PATHS;
  const paths = [...basePaths, ...(sedes ?? []).flatMap((sede) => [`/sedes/${sede.slug}`, `/carta/${sede.slug}`])];

  return paths.map((path) => ({
    url: absoluteUrl("es", path),
    changeFrequency: path.startsWith("/carta") || path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/carta") || path.startsWith("/sedes") ? 0.8 : 0.5,
    alternates: {
      languages: { "es-CO": absoluteUrl("es", path), en: absoluteUrl("en", path) },
    },
  }));
}
