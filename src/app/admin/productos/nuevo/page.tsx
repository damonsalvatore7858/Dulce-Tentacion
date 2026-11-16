import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Agregar producto" };

export default async function NewProductPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("id, nombre").order("orden");

  return (
    <PanelShell title="Agregar producto" intro="Después de guardar podrás poner precios por sede y una foto.">
      <Flash ok={ok} error={error} />
      <ProductForm values={{}} categories={data ?? []} />
    </PanelShell>
  );
}
