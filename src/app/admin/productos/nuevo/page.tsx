import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Agregar producto" };

export default async function NewProductPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();

  const [categories, sedes] = await Promise.all([
    supabase.from("categories").select("id, nombre").order("orden"),
    supabase.from("sedes").select("id, nombre, direccion").order("orden"),
  ]);

  return (
    <PanelShell
      title="Agregar producto"
      intro="Ingresa los datos del producto, sube su fotografía en alta calidad y define los precios para cada sede en un solo paso."
    >
      <Flash ok={ok} error={error} />
      <ProductForm
        values={{}}
        categories={categories.data ?? []}
        sedes={sedes.data ?? []}
      />
    </PanelShell>
  );
}
