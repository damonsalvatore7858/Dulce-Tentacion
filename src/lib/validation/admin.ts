import { z } from "zod";
import { clean } from "@/lib/validation/order";

const text = (max: number) => z.string().transform(clean).pipe(z.string().max(max));
const required = (max: number) => z.string().transform(clean).pipe(z.string().min(1).max(max));
const optional = (max: number) => text(max).transform((value) => (value === "" ? null : value));
const uuid = z.string().uuid();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

export const mfaCodeSchema = z.string().regex(/^\d{6}$/);

export const categorySchema = z.object({
  id: uuid.optional(),
  nombre: required(80),
  nombre_en: optional(80),
  orden: z.coerce.number().int().min(0).max(999),
  activa: z.boolean(),
});

export const productSchema = z.object({
  id: uuid.optional(),
  nombre: required(120),
  nombre_en: optional(120),
  descripcion: optional(600),
  descripcion_en: optional(600),
  category_id: uuid,
  destacado: z.boolean(),
  activo: z.boolean(),
  es_ejemplo: z.boolean(),
});

const MAPS_URL = /^https:\/\/(www\.google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/;
const MAPS_EMBED = /^https:\/\/www\.google\.com\/maps/;

export const sedeSchema = z.object({
  id: uuid,
  nombre: required(120),
  direccion: required(200),
  barrio: optional(80),
  telefono: optional(20).refine((v) => v === null || /^[0-9 +()-]{7,20}$/.test(v)),
  maps_url: optional(500).refine((v) => v === null || MAPS_URL.test(v)),
  maps_embed_url: optional(800).refine((v) => v === null || MAPS_EMBED.test(v)),
  horario_nota: optional(200),
  horario_nota_en: optional(200),
  domicilios: z.boolean(),
  activa: z.boolean(),
  orden: z.coerce.number().int().min(0).max(99),
});

export const newSedeSchema = z.object({ nombre: required(120), direccion: required(200) });

// Acepta "301 743 0183", "+57 301 743 0183" o "573017430183". Devuelve 57 + 10 dígitos, o null si está vacío.
export function normalizeWhatsapp(input: string): string | null | undefined {
  const digits = input.replace(/\D/g, "");
  if (digits === "") return null;
  if (/^3\d{9}$/.test(digits)) return `57${digits}`;
  if (/^57\d{10}$/.test(digits)) return digits;
  return undefined; // inválido
}

// "18.000", "$18000" o "" (vacío = consultar precio).
export function parsePrice(input: string): number | null | undefined {
  const digits = input.replace(/[\s.$,]/g, "");
  if (digits === "") return null;
  if (!/^\d{1,8}$/.test(digits)) return undefined;
  const value = Number(digits);
  return value <= 10_000_000 ? value : undefined;
}

// Datetime-local (hora de Colombia, UTC-5) -> ISO con zona.
export function colombiaToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00-05:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export const promoSchema = z.object({
  id: uuid.optional(),
  titulo: required(120),
  titulo_en: optional(120),
  texto: optional(400),
  texto_en: optional(400),
  sede_id: z.string().transform((v) => (v === "" ? null : v)).pipe(uuid.nullable()),
  desde: z.string(),
  hasta: z.string(),
  activa: z.boolean(),
});

export const bannerSchema = z.object({
  activo: z.boolean(),
  texto_es: text(300),
  texto_en: text(300),
});

export const modulosSchema = z.object({ eventos: z.boolean(), reservas: z.boolean() });

export const momentoSchema = z.object({ product_id: z.string().transform((v) => (v === "" ? null : v)).pipe(uuid.nullable()) });

export const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;
export const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
