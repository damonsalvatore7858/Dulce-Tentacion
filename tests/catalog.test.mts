import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SEDES,
} from "../src/lib/data/catalog-defaults.ts";
import { normalizeWhatsapp } from "../src/lib/validation/admin.ts";
import { orderSchema } from "../src/lib/validation/order.ts";

const uuidSchema = z.string().uuid();

test("DEFAULT_SEDES contiene sedes válidas de Ibagué con WhatsApp normalizable", () => {
  assert.strictEqual(DEFAULT_SEDES.length, 2);
  const ambala = DEFAULT_SEDES.find((s) => s.slug === "ambala");
  assert.ok(ambala, "Sede Ambalá no encontrada");
  assert.strictEqual(ambala.whatsapp, "573197873476");
  assert.strictEqual(ambala.telefono, "319 787 3476");

  for (const sede of DEFAULT_SEDES) {
    assert.ok(uuidSchema.safeParse(sede.id).success, `ID inválido para sede ${sede.slug}`);
    assert.ok(sede.nombre.length > 5);
    assert.strictEqual(sede.ciudad, "Ibagué");
    const normalized = normalizeWhatsapp(sede.whatsapp);
    assert.ok(normalized, `WhatsApp inválido para sede ${sede.slug}`);
    assert.strictEqual(normalized?.startsWith("57"), true);
  }
});

test("DEFAULT_CATEGORIES tiene las categorías oficiales incluyendo crepes", () => {
  assert.strictEqual(DEFAULT_CATEGORIES.length, 6);
  const slugs = DEFAULT_CATEGORIES.map((c) => c.slug);
  assert.deepStrictEqual(slugs, ["waffles", "cholados", "copas", "ensaladas", "postres", "crepes"]);
});

test("DEFAULT_PRODUCTS contiene 19 productos reales con UUIDs, nombres y precios válidos", () => {
  assert.strictEqual(DEFAULT_PRODUCTS.length, 19);
  const catSlugs = new Set(DEFAULT_CATEGORIES.map((c) => c.slug));

  for (const prod of DEFAULT_PRODUCTS) {
    // UUID válido
    assert.ok(uuidSchema.safeParse(prod.id).success, `UUID inválido en producto ${prod.slug}`);
    // Categoría existente
    assert.ok(catSlugs.has(prod.category_slug), `Categoría inexistente ${prod.category_slug} en ${prod.slug}`);
    // Nombres bilingües
    assert.ok(prod.nombre.length >= 3, `Nombre corto en ${prod.slug}`);
    assert.ok(prod.nombre_en.length >= 3, `Nombre inglés corto en ${prod.slug}`);
    // Descripciones presentes
    assert.ok(prod.descripcion.length >= 10, `Descripción corta en ${prod.slug}`);
    assert.ok(prod.descripcion_en.length >= 10, `Descripción inglés corta en ${prod.slug}`);
    // Precios COP válidos (entre $10.000 y $50.000 COP)
    assert.ok(prod.precio_cop >= 10000 && prod.precio_cop <= 50000, `Precio COP anormal en ${prod.slug}: ${prod.precio_cop}`);
  }
});

test("orderSchema acepta pedidos construidos con los nuevos productos del catálogo", () => {
  // Tomamos 3 productos del catálogo por defecto
  const items = DEFAULT_PRODUCTS.slice(0, 3).map((p) => ({
    productId: p.id,
    qty: 2,
  }));

  const order = {
    sedeSlug: "belen",
    lang: "es",
    mode: "pickup",
    name: "Carlos Pardo",
    items,
  };

  const parsed = orderSchema.safeParse(order);
  assert.ok(parsed.success, `orderSchema falló: ${JSON.stringify(parsed.error?.issues)}`);
});
