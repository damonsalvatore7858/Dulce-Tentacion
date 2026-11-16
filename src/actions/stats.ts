"use server";

import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { CLICK_CHANNELS } from "@/lib/stats/channels";
import { createServiceClient } from "@/lib/supabase/service";
import { slugSchema } from "@/lib/validation/params";

const schema = z.object({ sede: slugSchema, canal: z.enum(CLICK_CHANNELS) });

// Cuenta un clic (sin datos personales). Falla en silencio: nunca debe estorbar al visitante.
export async function trackClick(sede: string, canal: string): Promise<void> {
  const parsed = schema.safeParse({ sede, canal });
  if (!parsed.success) return;

  if ((await checkRateLimit("click")) !== "ok") return;

  const db = createServiceClient();
  if (!db) return;

  const { error } = await db.rpc("increment_click", { p_sede_slug: parsed.data.sede, p_canal: parsed.data.canal });
  if (error) console.error("[stats] increment_click", error.code);
}
