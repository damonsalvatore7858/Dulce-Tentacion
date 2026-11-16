"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { done, fail, flag, formToRecord, logAdminError, revalidatePublic } from "@/lib/admin/forms";
import { bannerSchema, modulosSchema, momentoSchema } from "@/lib/validation/admin";

const PATH = "/admin/ajustes";

async function saveSetting(clave: string, valor: unknown) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ clave, valor, publico: true }, { onConflict: "clave" });
  if (error) {
    logAdminError(`setting:${clave}`, error.code);
    fail(PATH, "guardar");
  }
  revalidatePublic();
  done(PATH);
}

export async function saveBanner(formData: FormData) {
  await requireAdmin();
  const parsed = bannerSchema.safeParse({ ...formToRecord(formData), activo: flag(formData, "activo") });
  if (!parsed.success) fail(PATH, "datos");
  await saveSetting("banner", parsed.data);
}

export async function saveModulos(formData: FormData) {
  await requireAdmin();
  const parsed = modulosSchema.safeParse({ eventos: flag(formData, "eventos"), reservas: flag(formData, "reservas") });
  if (!parsed.success) fail(PATH, "datos");
  await saveSetting("modulos", parsed.data);
}

export async function saveMomento(formData: FormData) {
  await requireAdmin();
  const parsed = momentoSchema.safeParse(formToRecord(formData));
  if (!parsed.success) fail(PATH, "datos");
  await saveSetting("producto_del_momento", {
    product_id: parsed.data.product_id ?? "00000000-0000-4000-8000-000000000000",
    activo: parsed.data.product_id !== null,
  });
}
