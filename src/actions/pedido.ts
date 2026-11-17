"use server";

import { formatCOP } from "@/lib/format/cop";
import { DEFAULT_PRODUCTS } from "@/lib/data/catalog-defaults";
import { LIMITS, type OrderResult } from "@/lib/order/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { validWhatsapp } from "@/lib/sede-links";
import { createPublicClient } from "@/lib/supabase/public";
import { addressSchema, orderSchema } from "@/lib/validation/order";
import { buildOrderMessage, whatsappLink, type OrderLine } from "@/lib/whatsapp/build-message";

type PriceRow = {
  product_id: string;
  precio_cop: number | null;
  disponible: boolean;
  products: { nombre: string; nombre_en: string | null } | { nombre: string; nombre_en: string | null }[] | null;
};

// El navegador envía SOLO ids, cantidades, sede y modo. Los precios salen de la base de datos.
export async function createWhatsAppOrder(input: unknown): Promise<OrderResult> {
  // Pre-guardia contra DoS por colecciones masivas antes del parseo Zod (mitigación GHSA-mrhx-c7xc-m3w5)
  if (
    typeof input !== "object" ||
    input === null ||
    ("items" in input &&
      Array.isArray((input as { items: unknown }).items) &&
      (input as { items: unknown[] }).items.length > LIMITS.maxDistinctItems)
  ) {
    return { ok: false, error: "invalid" };
  }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const limit = await checkRateLimit("order");
  if (limit === "limited") return { ok: false, error: "rate_limited" };
  if (limit === "unavailable") return { ok: false, error: "unavailable" };

  if (!(await verifyTurnstile(data.turnstileToken))) return { ok: false, error: "captcha" };

  const db = createPublicClient();
  if (!db) return { ok: false, error: "unavailable" };

  const sedeResult = await db
    .from("sedes")
    .select("id, nombre, whatsapp")
    .eq("slug", data.sedeSlug)
    .maybeSingle();
  if (sedeResult.error) return { ok: false, error: "unavailable" };
  if (!sedeResult.data) return { ok: false, error: "invalid" };

  const sede = sedeResult.data as { id: string; nombre: string; whatsapp: string | null };
  const number = validWhatsapp(sede.whatsapp);
  if (!number) return { ok: false, error: "no_whatsapp" };

  // Une ids repetidos y limita la cantidad por producto.
  const quantities = new Map<string, number>();
  for (const item of data.items) {
    quantities.set(
      item.productId,
      Math.min((quantities.get(item.productId) ?? 0) + item.qty, LIMITS.maxQtyPerItem),
    );
  }

  const pricesResult = await db
    .from("product_prices")
    .select("product_id, precio_cop, disponible, products(nombre, nombre_en)")
    .eq("sede_id", sede.id)
    .in("product_id", [...quantities.keys()]);
  if (pricesResult.error) return { ok: false, error: "unavailable" };

  // RLS ya oculta productos o sedes inactivos; además descartamos los no disponibles.
  const lines: OrderLine[] = [];
  let total = 0;
  let hasUnpriced = false;
  const processedProductIds = new Set<string>();

  for (const row of (pricesResult.data ?? []) as unknown as PriceRow[]) {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const qty = quantities.get(row.product_id);
    if (!product || !qty || !row.disponible) continue;

    processedProductIds.add(row.product_id);
    const name = data.lang === "en" && product.nombre_en ? product.nombre_en : product.nombre;
    lines.push({ name, qty, unitPrice: row.precio_cop });
    if (row.precio_cop === null) hasUnpriced = true;
    else total += row.precio_cop * qty;
  }

  // Complementar productos válidos de la carta que aún no se hayan sincronizado en DB
  for (const [productId, qty] of quantities.entries()) {
    if (!processedProductIds.has(productId)) {
      const def = DEFAULT_PRODUCTS.find((p) => p.id === productId);
      if (def) {
        processedProductIds.add(productId);
        const name = data.lang === "en" ? def.nombre_en : def.nombre;
        lines.push({ name, qty, unitPrice: def.precio_cop });
        total += def.precio_cop * qty;
      }
    }
  }

  if (lines.length === 0) return { ok: false, error: "empty" };
  const dropped = quantities.size - lines.length;

  const address =
    data.mode === "delivery" ? addressSchema.safeParse(data.address ?? "") : undefined;

  const message = buildOrderMessage(
    {
      lang: data.lang,
      sedeName: sede.nombre,
      lines,
      mode: data.mode,
      name: data.name,
      address: address?.success ? address.data : undefined,
      total,
      hasUnpriced,
    },
    formatCOP,
  );

  return { ok: true, url: whatsappLink(number, message), total, hasUnpriced, dropped };
}
