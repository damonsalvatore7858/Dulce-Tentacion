"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { done, fail, flag, formToRecord, logAdminError, revalidatePublic } from "@/lib/admin/forms";
import { colombiaToIso, promoSchema } from "@/lib/validation/admin";

const PATH = "/admin/promociones";

export async function savePromo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = promoSchema.safeParse({ ...formToRecord(formData), activa: flag(formData, "activa") });
  if (!parsed.success) fail(PATH, "datos");

  const desde = colombiaToIso(parsed.data.desde);
  const hasta = colombiaToIso(parsed.data.hasta);
  if (!desde || !hasta || hasta <= desde) fail(PATH, "fechas");

  const { id, ...rest } = parsed.data;
  const row = { ...rest, desde, hasta };
  const { error } = id
    ? await supabase.from("promotions").update(row).eq("id", id)
    : await supabase.from("promotions").insert(row);
  if (error) {
    logAdminError("savePromo", error.code);
    fail(PATH, "guardar");
  }
  revalidatePublic();
  done(PATH);
}

export async function deletePromo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) fail(PATH, "datos");
  const { error } = await supabase.from("promotions").delete().eq("id", id.data);
  if (error) fail(PATH, "guardar");
  revalidatePublic();
  done(PATH);
}
