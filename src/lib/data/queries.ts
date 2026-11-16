import "server-only";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  CatalogItem,
  Category,
  Moment,
  Promotion,
  Sede,
} from "./types";

// Todas las lecturas pasan por RLS: el público solo ve filas activas.
// null = no se pudo leer (error o falta configuración); [] = leído y vacío.

const SEDE_COLUMNS =
  "id, slug, nombre, direccion, barrio, ciudad, whatsapp, telefono, maps_url, maps_embed_url, horarios, horario_nota, horario_nota_en, domicilios, orden";

const PRODUCT_COLUMNS =
  "id, slug, nombre, nombre_en, descripcion, descripcion_en, image_path, destacado, es_ejemplo, category_id";

export function publicImageUrl(path: string | null): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  return `${base}/storage/v1/object/public/product-images/${path}`;
}

export async function getSedes(): Promise<Sede[] | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data, error } = await db.from("sedes").select(SEDE_COLUMNS).order("orden");
  if (error) {
    console.error("[data] getSedes", error.code);
    return null;
  }
  return (data ?? []) as unknown as Sede[];
}

export async function getSedeBySlug(slug: string): Promise<Sede | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("sedes")
    .select(SEDE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[data] getSedeBySlug", error.code);
    return null;
  }
  return (data as unknown as Sede | null) ?? null;
}

export async function getCategorias(): Promise<Category[] | null> {
  const db = createPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("categories")
    .select("id, slug, nombre, nombre_en, orden")
    .order("orden");
  if (error) {
    console.error("[data] getCategorias", error.code);
    return null;
  }
  return (data ?? []) as unknown as Category[];
}

type PriceRow = {
  precio_cop: number | null;
  disponible: boolean;
  products: Omit<CatalogItem, "precio_cop" | "disponible"> | Omit<CatalogItem, "precio_cop" | "disponible">[] | null;
};

export async function getCatalogo(
  sedeId: string,
): Promise<{ categories: Category[]; items: CatalogItem[] } | null> {
  const db = createPublicClient();
  if (!db) return null;

  const [cats, prices] = await Promise.all([
    db.from("categories").select("id, slug, nombre, nombre_en, orden").order("orden"),
    db
      .from("product_prices")
      .select(`precio_cop, disponible, products(${PRODUCT_COLUMNS})`)
      .eq("sede_id", sedeId),
  ]);

  if (cats.error || prices.error) {
    console.error("[data] getCatalogo", cats.error?.code ?? prices.error?.code);
    return null;
  }

  const items: CatalogItem[] = [];
  for (const row of (prices.data ?? []) as unknown as PriceRow[]) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product) continue;
    items.push({ ...product, precio_cop: row.precio_cop, disponible: row.disponible });
  }
  items.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return { categories: (cats.data ?? []) as unknown as Category[], items };
}

export async function getPromociones(): Promise<Promotion[]> {
  const db = createPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("promotions")
    .select("id, titulo, titulo_en, texto, texto_en, sede_id")
    .order("desde", { ascending: false });
  if (error) {
    console.error("[data] getPromociones", error.code);
    return [];
  }
  return (data ?? []) as unknown as Promotion[];
}

// ---------- Ajustes editables (site_settings) ----------

const bannerSchema = z.object({
  activo: z.boolean().default(false),
  texto_es: z.string().max(300).default(""),
  texto_en: z.string().max(300).default(""),
});

const modulosSchema = z.object({
  eventos: z.boolean().default(true),
  reservas: z.boolean().default(true),
});

const momentoSchema = z.object({
  product_id: z.string().uuid(),
  activo: z.boolean().default(true),
});

export type Banner = z.infer<typeof bannerSchema>;
export type Modulos = z.infer<typeof modulosSchema>;
export type Settings = Record<string, unknown>;

export async function getSettings(): Promise<Settings> {
  const db = createPublicClient();
  if (!db) return {};
  const { data, error } = await db.from("site_settings").select("clave, valor");
  if (error) {
    console.error("[data] getSettings", error.code);
    return {};
  }
  const map: Settings = {};
  for (const row of (data ?? []) as { clave: string; valor: unknown }[]) {
    map[row.clave] = row.valor;
  }
  return map;
}

export function parseBanner(settings: Settings): Banner {
  const parsed = bannerSchema.safeParse(settings.banner ?? {});
  return parsed.success ? parsed.data : { activo: false, texto_es: "", texto_en: "" };
}

export function parseModulos(settings: Settings): Modulos {
  const parsed = modulosSchema.safeParse(settings.modulos ?? {});
  return parsed.success ? parsed.data : { eventos: true, reservas: true };
}

export async function getMomento(settings: Settings): Promise<Moment | null> {
  const parsed = momentoSchema.safeParse(settings.producto_del_momento);
  if (!parsed.success || !parsed.data.activo) return null;

  const db = createPublicClient();
  if (!db) return null;

  const [product, prices] = await Promise.all([
    db
      .from("products")
      .select("slug, nombre, nombre_en, descripcion, descripcion_en, image_path")
      .eq("id", parsed.data.product_id)
      .maybeSingle(),
    db
      .from("product_prices")
      .select("sede_id, precio_cop, disponible")
      .eq("product_id", parsed.data.product_id),
  ]);

  if (product.error || prices.error || !product.data) return null;

  return {
    ...(product.data as unknown as Omit<Moment, "precios">),
    precios: (prices.data ?? []) as unknown as Moment["precios"],
  };
}
