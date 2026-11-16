"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { done, fail, flag, formToRecord, logAdminError, revalidatePublic } from "@/lib/admin/forms";
import { slugify, withSuffix } from "@/lib/admin/slugify";
import { DAYS, newSedeSchema, normalizeWhatsapp, sedeSchema, TIME } from "@/lib/validation/admin";

export async function saveSede(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = sedeSchema.safeParse({
    ...formToRecord(formData),
    domicilios: flag(formData, "domicilios"),
    activa: flag(formData, "activa"),
  });
  if (!parsed.success) fail("/admin/sedes", "datos");
  const path = `/admin/sedes/${parsed.data.id}`;

  const whatsapp = normalizeWhatsapp(String(formData.get("whatsapp") ?? ""));
  if (whatsapp === undefined) fail(path, "whatsapp");

  // Horario simple: una franja por día. Día sin ambas horas = cerrado.
  const horarios: Record<string, { abre: string; cierra: string }[]> = {};
  for (const day of DAYS) {
    const abre = String(formData.get(`abre_${day}`) ?? "");
    const cierra = String(formData.get(`cierra_${day}`) ?? "");
    if (abre === "" && cierra === "") continue;
    if (!TIME.test(abre) || !TIME.test(cierra)) fail(path, "horario");
    horarios[day] = [{ abre, cierra }];
  }

  const { id, ...row } = parsed.data;
  const { error } = await supabase.from("sedes").update({ ...row, whatsapp, horarios }).eq("id", id);
  if (error) {
    logAdminError("saveSede", error.code);
    fail(path, "guardar");
  }
  revalidatePublic();
  done(path);
}

// Nueva sede (por ejemplo Dulce Rosé): nace INACTIVA para completarla antes de publicarla.
export async function createSede(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = newSedeSchema.safeParse(formToRecord(formData));
  if (!parsed.success) fail("/admin/sedes", "datos");

  const base = slugify(parsed.data.nombre);
  let createdId: string | undefined;
  for (let attempt = 0; attempt < 3 && !createdId; attempt++) {
    const { data, error } = await supabase
      .from("sedes")
      .insert({ ...parsed.data, slug: withSuffix(base, attempt), activa: false, orden: 99 })
      .select("id")
      .single();
    if (data) createdId = data.id as string;
    else if (error?.code !== "23505") {
      logAdminError("createSede", error?.code);
      break;
    }
  }
  if (!createdId) fail("/admin/sedes", "guardar");

  const { data: products } = await supabase.from("products").select("id");
  if (products && products.length > 0) {
    await supabase
      .from("product_prices")
      .insert(products.map((product) => ({ product_id: product.id, sede_id: createdId, precio_cop: null, disponible: true })));
  }
  revalidatePublic();
  done(`/admin/sedes/${createdId}`);
}
