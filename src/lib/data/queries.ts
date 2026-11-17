import "server-only";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SEDES,
} from "./catalog-defaults";
import type {
  CatalogItem,
  Category,
  Moment,
  Promotion,
  Sede,
} from "./types";

// Todas las lecturas pasan por RLS: el público solo ve filas activas.
// Si Supabase no responde o faltan registros, se utiliza la carta real verificada.

const SEDE_COLUMNS =
  "id, slug, nombre, direccion, barrio, ciudad, whatsapp, telefono, maps_url, maps_embed_url, horarios, horario_nota, horario_nota_en, domicilios, orden";

const PRODUCT_COLUMNS =
  "id, slug, nombre, nombre_en, descripcion, descripcion_en, image_path, video_url, destacado, es_ejemplo, category_id";

export function publicImageUrl(path: string | null): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  return `${base}/storage/v1/object/public/product-images/${path}`;
}

export function publicVideoUrl(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) return urlOrPath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-videos/${urlOrPath}`;
}

export async function getSedes(): Promise<Sede[]> {
  const db = createPublicClient();
  if (!db) return DEFAULT_SEDES;
  const { data, error } = await db.from("sedes").select(SEDE_COLUMNS).order("orden");
  if (error || !data || data.length === 0) {
    if (error) console.error("[data] getSedes", error.code);
    return DEFAULT_SEDES;
  }
  return data as unknown as Sede[];
}

export async function getSedeBySlug(slug: string): Promise<Sede | null> {
  const db = createPublicClient();
  if (!db) return DEFAULT_SEDES.find((s) => s.slug === slug) ?? null;
  const { data, error } = await db
    .from("sedes")
    .select(SEDE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("[data] getSedeBySlug", error.code);
    return DEFAULT_SEDES.find((s) => s.slug === slug) ?? null;
  }
  return data as unknown as Sede;
}

export async function getCategorias(): Promise<Category[]> {
  const db = createPublicClient();
  if (!db) return DEFAULT_CATEGORIES;
  const { data, error } = await db
    .from("categories")
    .select("id, slug, nombre, nombre_en, orden")
    .order("orden");
  if (error || !data || data.length === 0) {
    if (error) console.error("[data] getCategorias", error.code);
    return DEFAULT_CATEGORIES;
  }
  return data as unknown as Category[];
}

type PriceRow = {
  precio_cop: number | null;
  disponible: boolean;
  products: Omit<CatalogItem, "precio_cop" | "disponible"> | Omit<CatalogItem, "precio_cop" | "disponible">[] | null;
};

export async function getCatalogo(
  sedeId: string,
): Promise<{ categories: Category[]; items: CatalogItem[] }> {
  const defaultsBySlug = new Map(DEFAULT_PRODUCTS.map((p) => [p.slug, p]));
  const defaultCategoryBySlug = new Map(DEFAULT_CATEGORIES.map((c) => [c.slug, c]));

  const db = createPublicClient();
  if (!db) {
    return buildDefaultCatalog();
  }

  const [cats, prices] = await Promise.all([
    db.from("categories").select("id, slug, nombre, nombre_en, orden").order("orden"),
    db
      .from("product_prices")
      .select(`precio_cop, disponible, products(${PRODUCT_COLUMNS})`)
      .eq("sede_id", sedeId),
  ]);

  if (cats.error || prices.error) {
    console.error("[data] getCatalogo error, usando respaldo", cats.error?.code ?? prices.error?.code);
    return buildDefaultCatalog();
  }

  // Unificar categorías de DB con categorías base
  const categoriesMap = new Map<string, Category>();
  for (const c of (cats.data ?? []) as unknown as Category[]) {
    categoriesMap.set(c.slug, c);
  }
  for (const c of DEFAULT_CATEGORIES) {
    if (!categoriesMap.has(c.slug)) {
      categoriesMap.set(c.slug, c);
    }
  }
  const finalCategories = Array.from(categoriesMap.values()).sort((a, b) => a.orden - b.orden);

  const itemsMap = new Map<string, CatalogItem>();
  for (const row of (prices.data ?? []) as unknown as PriceRow[]) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product) continue;
    const def = defaultsBySlug.get(product.slug);
    itemsMap.set(product.slug, {
      ...product,
      descripcion: product.descripcion || def?.descripcion || null,
      descripcion_en: product.descripcion_en || def?.descripcion_en || null,
      precio_cop: row.precio_cop ?? def?.precio_cop ?? null,
      disponible: row.disponible,
      image_path: product.image_path || def?.image_path || null,
    });
  }

  // Complementar productos reales verificados
  for (const def of DEFAULT_PRODUCTS) {
    if (!itemsMap.has(def.slug)) {
      const cat = categoriesMap.get(def.category_slug) || defaultCategoryBySlug.get(def.category_slug);
      if (cat) {
        itemsMap.set(def.slug, {
          id: def.id,
          slug: def.slug,
          nombre: def.nombre,
          nombre_en: def.nombre_en,
          descripcion: def.descripcion,
          descripcion_en: def.descripcion_en,
          category_id: cat.id,
          image_path: def.image_path ?? null,
          destacado: def.destacado,
          es_ejemplo: false,
          precio_cop: def.precio_cop,
          disponible: true,
        });
      }
    }
  }

  const items = Array.from(itemsMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return { categories: finalCategories, items };
}

function buildDefaultCatalog(): { categories: Category[]; items: CatalogItem[] } {
  const catMap = new Map(DEFAULT_CATEGORIES.map((c) => [c.slug, c]));
  const items: CatalogItem[] = DEFAULT_PRODUCTS.map((p) => {
    const cat = catMap.get(p.category_slug) ?? DEFAULT_CATEGORIES[0];
    return {
      id: p.id,
      slug: p.slug,
      nombre: p.nombre,
      nombre_en: p.nombre_en,
      descripcion: p.descripcion,
      descripcion_en: p.descripcion_en,
      category_id: cat.id,
      image_path: p.image_path ?? null,
      destacado: p.destacado,
      es_ejemplo: false,
      precio_cop: p.precio_cop,
      disponible: true,
    };
  }).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return { categories: DEFAULT_CATEGORIES, items };
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

export { parseShowcaseVideos, type ShowcaseVideoItem } from "./showcase";

export async function getMomento(settings: Settings): Promise<Moment | null> {
  const parsed = momentoSchema.safeParse(settings.producto_del_momento);
  const signatureSlug = "copa-gigante-fresas-chantilli-chocolate";
  const defSignature = DEFAULT_PRODUCTS.find((p) => p.slug === signatureSlug);

  if (!parsed.success || !parsed.data.activo) {
    if (!defSignature) return null;
    return {
      slug: defSignature.slug,
      nombre: defSignature.nombre,
      nombre_en: defSignature.nombre_en,
      descripcion: defSignature.descripcion,
      descripcion_en: defSignature.descripcion_en,
      image_path: defSignature.image_path ?? null,
      precios: [
        { sede_id: "belen", precio_cop: defSignature.precio_cop, disponible: true },
        { sede_id: "ambala", precio_cop: defSignature.precio_cop, disponible: true },
      ],
    };
  }

  const db = createPublicClient();
  if (!db) {
    if (!defSignature) return null;
    return {
      slug: defSignature.slug,
      nombre: defSignature.nombre,
      nombre_en: defSignature.nombre_en,
      descripcion: defSignature.descripcion,
      descripcion_en: defSignature.descripcion_en,
      image_path: defSignature.image_path ?? null,
      precios: [
        { sede_id: "belen", precio_cop: defSignature.precio_cop, disponible: true },
        { sede_id: "ambala", precio_cop: defSignature.precio_cop, disponible: true },
      ],
    };
  }

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

  if (product.error || prices.error || !product.data) {
    if (!defSignature) return null;
    return {
      slug: defSignature.slug,
      nombre: defSignature.nombre,
      nombre_en: defSignature.nombre_en,
      descripcion: defSignature.descripcion,
      descripcion_en: defSignature.descripcion_en,
      image_path: defSignature.image_path ?? null,
      precios: [
        { sede_id: "belen", precio_cop: defSignature.precio_cop, disponible: true },
        { sede_id: "ambala", precio_cop: defSignature.precio_cop, disponible: true },
      ],
    };
  }

  const prodData = product.data as unknown as Omit<Moment, "precios">;
  const def = DEFAULT_PRODUCTS.find((p) => p.slug === prodData.slug);

  return {
    ...prodData,
    descripcion: prodData.descripcion || def?.descripcion || null,
    descripcion_en: prodData.descripcion_en || def?.descripcion_en || null,
    precios: (prices.data ?? []) as unknown as Moment["precios"],
  };
}
