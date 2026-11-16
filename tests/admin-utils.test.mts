import test from "node:test";
import assert from "node:assert/strict";
import { detectImage } from "../src/lib/admin/image.ts";
import { slugify, withSuffix } from "../src/lib/admin/slugify.ts";
import { normalizeWhatsapp } from "../src/lib/validation/admin.ts";

test("detectImage identifica JPEG, PNG y WebP por magic bytes", () => {
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.deepStrictEqual(detectImage(jpegBytes), { mime: "image/jpeg", ext: "jpg" });

  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.deepStrictEqual(detectImage(pngBytes), { mime: "image/png", ext: "png" });

  // "RIFF" + 4 bytes size + "WEBP"
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  assert.deepStrictEqual(detectImage(webpBytes), { mime: "image/webp", ext: "webp" });

  const badBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
  assert.strictEqual(detectImage(badBytes), null);
});

test("slugify normaliza cadenas con tildes y caracteres especiales", () => {
  assert.strictEqual(slugify("Copa Tentación & Helado"), "copa-tentacion-helado");
  assert.strictEqual(slugify("  ¡Waffle Con Nutella!  "), "waffle-con-nutella");
  assert.strictEqual(slugify("Café con leche"), "cafe-con-leche");
});

test("withSuffix agrega sufijo para resolución de colisiones", () => {
  assert.strictEqual(withSuffix("waffle", 0), "waffle");
  const s1 = withSuffix("waffle", 1);
  assert.ok(s1.startsWith("waffle-") && s1.length > "waffle-".length);
  const s2 = withSuffix("waffle", 2);
  assert.ok(s2.startsWith("waffle-") && s2.length > "waffle-".length);
});

test("normalizeWhatsapp normaliza formatos comunes colombianos a 57 + 10 dígitos", () => {
  assert.strictEqual(normalizeWhatsapp("301 743 0183"), "573017430183");
  assert.strictEqual(normalizeWhatsapp("+57 301 743 0183"), "573017430183");
  assert.strictEqual(normalizeWhatsapp("573017430183"), "573017430183");
  assert.strictEqual(normalizeWhatsapp(""), null);
  assert.strictEqual(normalizeWhatsapp("123"), undefined); // Número inválido
});
