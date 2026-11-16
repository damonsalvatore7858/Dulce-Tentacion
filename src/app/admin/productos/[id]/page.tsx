import Image from "next/image";
import { notFound } from "next/navigation";
import { z } from "zod";
import { deleteProduct, removeProductImage, savePrices, uploadProductImage } from "@/actions/admin/catalog";
import { Check, Field } from "@/components/admin/fields";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Flash } from "@/components/admin/flash";
import { PanelShell } from "@/components/admin/panel-shell";
import { ProductForm, type ProductValues } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    supabase.from("sedes").select("id, nombre").order("orden"),
    supabase.from("product_prices").select("sede_id, precio_cop, disponible").eq("product_id", id),
  ]);
  if (!product.data) notFound();
  const values = product.data as ProductValues & { image_path: string | null };
  const image = publicImageUrl(values.image_path);

  return (
    <PanelShell title={values.nombre ?? "Producto"}>
      <Flash ok={ok} error={error} />
      <ProductForm values={values} categories={categories.data ?? []} />

      <section className="flex max-w-2xl flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl">Precios por sede</h2>
        <p className="text-sm text-muted-foreground">Deja el precio vacío para mostrar &quot;Consultar precio&quot;.</p>
        <form action={savePrices} className="flex flex-col gap-4">
          <input type="hidden" name="product_id" value={id} />
          {(sedes.data ?? []).map((sede) => {
            const price = (prices.data ?? []).find((row) => row.sede_id === sede.id);
            return (
              <div key={sede.id} className="flex flex-col gap-2 rounded-field bg-muted p-4">
                <input type="hidden" name="sede_id" value={sede.id} />
                <Field id={`precio_${sede.id}`} label={`${sede.nombre} (pesos)`}>
                  <Input
                    id={`precio_${sede.id}`}
                    name={`precio_${sede.id}`}
                    inputMode="numeric"
                    placeholder="18000"
                    defaultValue={price?.precio_cop ?? ""}
                  />
                </Field>
                <Check name={`disp_${sede.id}`} label="Disponible" defaultChecked={price?.disponible ?? true} />
              </div>
            );
          })}
          <Button type="submit" size="lg" className="self-start">
            Guardar precios
          </Button>
        </form>
      </section>

      <section className="flex max-w-2xl flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl">Foto</h2>
        {image ? (
          <Image src={image} alt={`Foto de ${values.nombre ?? "producto"}`} width={320} height={240} className="h-48 w-64 rounded-field object-cover" />
        ) : (
          <p className="text-muted-foreground">Todavía no tiene foto.</p>
        )}
        <form action={uploadProductImage} className="flex flex-col gap-3">
          <input type="hidden" name="product_id" value={id} />
          <Field id="file" label="Subir foto (JPG, PNG o WebP, máximo 2 MB)">
            <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="text-base" />
          </Field>
          <Button type="submit" className="self-start">
            Subir foto
          </Button>
        </form>
        {image ? (
          <form action={removeProductImage}>
            <input type="hidden" name="product_id" value={id} />
            <Button type="submit" variant="ghost" size="sm">
              Quitar foto
            </Button>
          </form>
        ) : null}
      </section>

      <form action={deleteProduct} className="max-w-2xl">
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmit message="¿Borrar este producto para siempre? No se puede deshacer." variant="outline" size="sm">
          Borrar producto
        </ConfirmSubmit>
      </form>
    </PanelShell>
  );
}
