"use server";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth/require-admin";
import { done, fail, flag, formToRecord, logAdminError, revalidatePublic } from "@/lib/admin/forms";
import { detectImage, MAX_IMAGE_BYTES } from "@/lib/admin/image";
import { slugify, withSuffix } from "@/lib/admin/slugify";
import { categorySchema, parsePrice, productSchema } from "@/lib/validation/admin";
import { z } from "zod";

const BUCKET = "product-images";
const uuid = z.string().uuid();

// ---------- Categorías ----------
export async function saveCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/categorias";
  const parsed = categorySchema.safeParse({ ...formToRecord(formData), activa: flag(formData, "activa") });
  if (!parsed.success) fail(path, "datos");

  const { id, ...row } = parsed.data;
  let errorCode: string | undefined;
  if (id) {
    const { error } = await supabase.from("categories").update(row).eq("id", id);
    errorCode = error?.code ?? (error ? "x" : undefined);
  } else {
    const base = slugify(row.nombre);
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.from("categories").insert({ ...row, slug: withSuffix(base, attempt) });
      errorCode = error ? (error.code ?? "x") : undefined;
      if (!error || error.code !== "23505") break;
    }
  }
  if (errorCode) {
    logAdminError("saveCategory", errorCode);
    fail(path, "guardar");
  }
  revalidatePublic();
  done(path);
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const path = "/admin/categorias";
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) fail(path, "datos");

  const { error } = await supabase.from("categories").delete().eq("id", id.data);
  if (error) {
    logAdminError("deleteCategory", error.code);
    fail(path, error.code === "23503" ? "enuso" : "guardar");
  }
  revalidatePublic();
  done(path);
}

// ---------- Productos ----------
export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse({
    ...formToRecord(formData),
    destacado: flag(formData, "destacado"),
    activo: flag(formData, "activo"),
    es_ejemplo: flag(formData, "es_ejemplo"),
  });
  const backPath = parsed.success && parsed.data.id ? `/admin/productos/${parsed.data.id}` : "/admin/productos/nuevo";
  if (!parsed.success) fail(backPath, "datos");

  const { id, ...row } = parsed.data;

  if (id) {
    const { error } = await supabase.from("products").update(row).eq("id", id);
    if (error) {
      logAdminError("saveProduct", error.code);
      fail(backPath, "guardar");
    }
    revalidatePublic();
    done(backPath);
  }

  // Crear: slug único y una fila de precio (sin precio) por cada sede.
  const base = slugify(row.nombre);
  let createdId: string | undefined;
  for (let attempt = 0; attempt < 3 && !createdId; attempt++) {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...row, slug: withSuffix(base, attempt) })
      .select("id")
      .single();
    if (data) createdId = data.id as string;
    else if (error?.code !== "23505") {
      logAdminError("createProduct", error?.code);
      break;
    }
  }
  if (!createdId) fail(backPath, "guardar");

  const { data: sedes } = await supabase.from("sedes").select("id");
  if (sedes && sedes.length > 0) {
    await supabase
      .from("product_prices")
      .insert(sedes.map((sede) => ({ product_id: createdId, sede_id: sede.id, precio_cop: null, disponible: true })));
  }
  revalidatePublic();
  done(`/admin/productos/${createdId}`);
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) fail("/admin/productos", "datos");

  const { data: product } = await supabase.from("products").select("image_path").eq("id", id.data).maybeSingle();
  const { error } = await supabase.from("products").delete().eq("id", id.data);
  if (error) {
    logAdminError("deleteProduct", error.code);
    fail("/admin/productos", "guardar");
  }
  if (product?.image_path) await supabase.storage.from(BUCKET).remove([product.image_path as string]);
  revalidatePublic();
  done("/admin/productos");
}

// Activar o desactivar un producto al instante (en todas las sedes).
export async function toggleProductActive(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) fail("/admin/productos", "datos");
  const { error } = await supabase.from("products").update({ activo: formData.get("value") === "true" }).eq("id", id.data);
  if (error) fail("/admin/productos", "guardar");
  revalidatePublic();
  done("/admin/productos");
}

// Marcar agotado / disponible en UNA sede al instante.
export async function toggleAvailability(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = uuid.safeParse(formData.get("product_id"));
  const sedeId = uuid.safeParse(formData.get("sede_id"));
  if (!productId.success || !sedeId.success) fail("/admin/productos", "datos");
  const { error } = await supabase
    .from("product_prices")
    .update({ disponible: formData.get("value") === "true" })
    .eq("product_id", productId.data)
    .eq("sede_id", sedeId.data);
  if (error) fail("/admin/productos", "guardar");
  revalidatePublic();
  done("/admin/productos");
}

// ---------- Precios por sede ----------
export async function savePrices(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = uuid.safeParse(formData.get("product_id"));
  if (!productId.success) fail("/admin/productos", "datos");
  const path = `/admin/productos/${productId.data}`;

  const sedeIds = formData.getAll("sede_id").map(String);
  const rows: { product_id: string; sede_id: string; precio_cop: number | null; disponible: boolean }[] = [];
  for (const sedeId of sedeIds) {
    if (!uuid.safeParse(sedeId).success) fail(path, "datos");
    const price = parsePrice(String(formData.get(`precio_${sedeId}`) ?? ""));
    if (price === undefined) fail(path, "precio");
    rows.push({
      product_id: productId.data,
      sede_id: sedeId,
      precio_cop: price,
      disponible: flag(formData, `disp_${sedeId}`),
    });
  }
  if (rows.length === 0) fail(path, "datos");

  const { error } = await supabase.from("product_prices").upsert(rows, { onConflict: "product_id,sede_id" });
  if (error) {
    logAdminError("savePrices", error.code);
    fail(path, "guardar");
  }
  revalidatePublic();
  done(path);
}

// ---------- Imagen del producto ----------
export async function uploadProductImage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = uuid.safeParse(formData.get("product_id"));
  if (!productId.success) fail("/admin/productos", "datos");
  const path = `/admin/productos/${productId.data}`;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) fail(path, "imagen");
  if (file.size > MAX_IMAGE_BYTES) fail(path, "imagen_grande");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectImage(bytes);
  if (!kind) fail(path, "imagen_tipo");

  // Nombre nuevo generado por el servidor: se ignora el nombre original del archivo.
  const objectPath = `${productId.data}/${randomUUID()}.${kind.ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: kind.mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) {
    logAdminError("uploadImage", uploadError.name);
    fail(path, "imagen_subida");
  }

  const { data: previous } = await supabase.from("products").select("image_path").eq("id", productId.data).maybeSingle();
  const { error } = await supabase.from("products").update({ image_path: objectPath }).eq("id", productId.data);
  if (error) {
    await supabase.storage.from(BUCKET).remove([objectPath]);
    fail(path, "guardar");
  }
  if (previous?.image_path) await supabase.storage.from(BUCKET).remove([previous.image_path as string]);
  revalidatePublic();
  done(path);
}

export async function removeProductImage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = uuid.safeParse(formData.get("product_id"));
  if (!productId.success) fail("/admin/productos", "datos");
  const path = `/admin/productos/${productId.data}`;

  const { data: product } = await supabase.from("products").select("image_path").eq("id", productId.data).maybeSingle();
  const { error } = await supabase.from("products").update({ image_path: null }).eq("id", productId.data);
  if (error) fail(path, "guardar");
  if (product?.image_path) await supabase.storage.from(BUCKET).remove([product.image_path as string]);
  revalidatePublic();
  done(path);
}
