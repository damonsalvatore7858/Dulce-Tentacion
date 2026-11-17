import { notFound } from "next/navigation";
import { z } from "zod";
import { deleteProduct } from "@/actions/admin/catalog";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Flash } from "@/components/admin/flash";
import { PanelShell } from "@/components/admin/panel-shell";
import { ProductForm, type ProductValues } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { publicImageUrl } from "@/lib/data/queries";

export const metadata = { title: "Editar producto" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
};

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const { supabase } = await requireAdmin();
  const [product, categories, sedes, prices] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, nombre").order("orden"),
    supabase.from("sedes").select("id, nombre, direccion").order("orden"),
    supabase.from("product_prices").select("sede_id, precio_cop, disponible").eq("product_id", id),
  ]);

  if (!product.data) notFound();
  const values = product.data as ProductValues & { image_path: string | null };
  const image = publicImageUrl(values.image_path);

  return (
    <PanelShell
      title={`Editar: ${values.nombre ?? "Producto"}`}
      intro="Actualiza la información, reemplaza la fotografía en alta calidad o ajusta los precios por sede."
    >
      <Flash ok={ok} error={error} />

      <ProductForm
        values={values}
        categories={categories.data ?? []}
        sedes={sedes.data ?? []}
        prices={prices.data ?? []}
        initialImageUrl={image}
        initialVideoUrl={values.video_url}
      />

      <div className="pt-6 border-t border-border/80 max-w-3xl">
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmit
            message="¿Borrar este producto para siempre? No se puede deshacer."
            variant="outline"
            size="sm"
          >
            Borrar producto permanentemente
          </ConfirmSubmit>
        </form>
      </div>
    </PanelShell>
  );
}
