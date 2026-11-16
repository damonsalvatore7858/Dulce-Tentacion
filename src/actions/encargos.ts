"use server";

import type { LinkResult } from "@/lib/order/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { validWhatsapp } from "@/lib/sede-links";
import { createPublicClient } from "@/lib/supabase/public";
import { eventSchema } from "@/lib/validation/order";
import { buildEventMessage, whatsappLink } from "@/lib/whatsapp/build-message";

// Reservas, eventos y pedidos por encargo: se arma un mensaje y NO se guarda nada.
export async function createEventLink(input: unknown): Promise<LinkResult> {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const limit = await checkRateLimit("event");
  if (limit === "limited") return { ok: false, error: "rate_limited" };
  if (limit === "unavailable") return { ok: false, error: "unavailable" };

  if (!(await verifyTurnstile(data.turnstileToken))) return { ok: false, error: "captcha" };

  const db = createPublicClient();
  if (!db) return { ok: false, error: "unavailable" };

  const result = await db
    .from("sedes")
    .select("nombre, whatsapp")
    .eq("slug", data.sedeSlug)
    .maybeSingle();
  if (result.error) return { ok: false, error: "unavailable" };
  if (!result.data) return { ok: false, error: "invalid" };

  const sede = result.data as { nombre: string; whatsapp: string | null };
  const number = validWhatsapp(sede.whatsapp);
  if (!number) return { ok: false, error: "no_whatsapp" };

  const message = buildEventMessage({
    lang: data.lang,
    sedeName: sede.nombre,
    kind: data.kind,
    name: data.name,
    date: data.date,
    time: data.time,
    guests: data.guests,
    notes: data.notes || undefined,
  });

  return { ok: true, url: whatsappLink(number, message) };
}
