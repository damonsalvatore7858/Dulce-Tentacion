import { z } from "zod";
import { EVENT_KINDS, LIMITS, ORDER_MODES } from "@/lib/order/limits";
import { slugSchema } from "@/lib/validation/params";

// Quita caracteres de control y espacios repetidos.
const CONTROL = /[\u0000-\u001F\u007F]/g;
export const clean = (value: string) => value.replace(CONTROL, " ").replace(/\s+/g, " ").trim();

// new RegExp(...) con "u" para usar \p{L} sin depender del target de TypeScript.
const NAME_RE = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}' .-]*$", "u");
const ADDRESS_RE = new RegExp("^[\\p{L}\\p{M}\\p{N} #.,°/'-]+$", "u");

export const nameSchema = z
  .string()
  .transform(clean)
  .pipe(z.string().min(2).max(LIMITS.nameMax).regex(NAME_RE));

export const addressSchema = z
  .string()
  .transform(clean)
  .pipe(z.string().min(5).max(LIMITS.addressMax).regex(ADDRESS_RE));

const langSchema = z.enum(["es", "en"]);
const tokenSchema = z.string().max(2048).optional();

export const orderSchema = z
  .object({
    sedeSlug: slugSchema,
    lang: langSchema,
    mode: z.enum(ORDER_MODES),
    name: nameSchema,
    address: z.string().max(300).optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          qty: z.number().int().min(1).max(LIMITS.maxQtyPerItem),
        }),
      )
      .min(1)
      .max(LIMITS.maxDistinctItems),
    turnstileToken: tokenSchema,
  })
  .superRefine((value, ctx) => {
    if (value.mode === "delivery" && !addressSchema.safeParse(value.address ?? "").success) {
      ctx.addIssue({ code: "custom", path: ["address"], message: "address" });
    }
    const total = value.items.reduce((sum, item) => sum + item.qty, 0);
    if (total > LIMITS.maxTotalQty) {
      ctx.addIssue({ code: "custom", path: ["items"], message: "too_many" });
    }
  });

// Fecha "hoy" en Colombia (UTC-5) como YYYY-MM-DD.
function todayInColombia(): string {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const eventSchema = z
  .object({
    sedeSlug: slugSchema,
    lang: langSchema,
    kind: z.enum(EVENT_KINDS),
    name: nameSchema,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    guests: z.number().int().min(1).max(LIMITS.guestsMax),
    notes: z
      .string()
      .transform(clean)
      .pipe(z.string().max(LIMITS.notesMax))
      .optional(),
    turnstileToken: tokenSchema,
  })
  .superRefine((value, ctx) => {
    const parsed = new Date(`${value.date}T00:00:00Z`);
    const valid = !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value.date;
    const today = todayInColombia();
    const limit = new Date(`${today}T00:00:00Z`);
    limit.setUTCDate(limit.getUTCDate() + 365);
    if (!valid || value.date < today || parsed > limit) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "date" });
    }
  });

export type OrderInput = z.input<typeof orderSchema>;
export type EventInput = z.input<typeof eventSchema>;
