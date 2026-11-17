import test from "node:test";
import assert from "node:assert/strict";
import { detectImage, MAX_IMAGE_BYTES } from "../src/lib/admin/image.ts";
import { slugify, withSuffix } from "../src/lib/admin/slugify.ts";
import { normalizeWhatsapp } from "../src/lib/validation/admin.ts";
import { parseVideoUrl } from "../src/lib/media/video.ts";
import { menuJsonLd } from "../src/lib/seo/json-ld.ts";
import { DEFAULT_SEDES } from "../src/lib/data/catalog-defaults.ts";

test("MAX_IMAGE_BYTES permite subida de fotos en alta resolución de hasta 10 MB", () => {
  assert.strictEqual(MAX_IMAGE_BYTES, 10 * 1024 * 1024);
});

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

test("parseVideoUrl identifica correctamente YouTube, Instagram, TikTok y videos directos", () => {
  const yt = parseVideoUrl("https://youtube.com/shorts/kJQP7kiw5Fk?feature=share");
  assert.strictEqual(yt?.type, "youtube");
  assert.ok(yt?.embedUrl?.includes("youtube-nocookie.com/embed/kJQP7kiw5Fk"));

  const ig = parseVideoUrl("https://www.instagram.com/reel/C89abcdefgh/?igsh=xyz");
  assert.strictEqual(ig?.type, "instagram");
  assert.strictEqual(ig?.embedUrl, "https://www.instagram.com/reel/C89abcdefgh/embed");

  const direct = parseVideoUrl("https://storage.example.com/videos/waffle.mp4");
  assert.strictEqual(direct?.type, "direct");
  assert.strictEqual(direct?.isDirectFile, true);

  assert.strictEqual(parseVideoUrl(""), null);
});

test("menuJsonLd genera esquema Schema.org Menu y MenuItem con precios válidos", () => {
  const sede = DEFAULT_SEDES[0];
  const sections = [
    {
      category: { nombre: "Waffles", slug: "waffles" },
      items: [
        {
          id: "item-1",
          nombre: "Waffle Selva Negra",
          precio_cop: 23000,
          disponible: true,
        },
      ],
    },
  ];

  const jsonLd = menuJsonLd(sede, sections, "es");
  assert.strictEqual(jsonLd["@type"], "Menu");
  assert.strictEqual(jsonLd.hasMenuSection.length, 1);
  assert.strictEqual(jsonLd.hasMenuSection[0].name, "Waffles");
  assert.strictEqual(jsonLd.hasMenuSection[0].hasMenuItem.length, 1);
  assert.strictEqual(jsonLd.hasMenuSection[0].hasMenuItem[0].name, "Waffle Selva Negra");
  assert.strictEqual(jsonLd.hasMenuSection[0].hasMenuItem[0].offers?.price, 23000);
});
