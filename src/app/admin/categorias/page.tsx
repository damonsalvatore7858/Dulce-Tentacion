import { deleteCategory, saveCategory } from "@/actions/admin/catalog";
import { Check, Field } from "@/components/admin/fields";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Categorías" };

type Category = { id: string; nombre: string; nombre_en: string | null; orden: number; activa: boolean };

function CategoryForm({ category }: { category?: Category }) {
  const key = category?.id ?? "nueva";
  return (
    <form action={saveCategory} className="flex flex-col gap-3">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <Field id={`n-${key}`} label="Nombre">
          <Input id={`n-${key}`} name="nombre" required maxLength={80} defaultValue={category?.nombre ?? ""} />
        </Field>
        <Field id={`e-${key}`} label="En inglés (opcional)">
          <Input id={`e-${key}`} name="nombre_en" maxLength={80} defaultValue={category?.nombre_en ?? ""} />
        </Field>
        <Field id={`o-${key}`} label="Orden" hint="Más bajo = aparece primero">
          <Input id={`o-${key}`} name="orden" type="number" min={0} max={999} required defaultValue={category?.orden ?? 0} />
        </Field>
      </div>
      <Check name="activa" label="Visible en el sitio" defaultChecked={category?.activa ?? true} />
      <Button type="submit" size="sm" className="self-start">
        {category ? "Guardar" : "Agregar categoría"}
      </Button>
    </form>
  );
}

export default async function CategoriesPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("id, nombre, nombre_en, orden, activa").order("orden");
  const categories = (data ?? []) as Category[];

  return (
    <PanelShell title="Categorías" intro="Agrupan los productos de la carta.">
      <Flash ok={ok} error={error} />
      <Card className="max-w-3xl p-5">
        <h2 className="pb-3 font-display text-2xl">Nueva categoría</h2>
        <CategoryForm />
      </Card>
      <ul className="flex max-w-3xl flex-col gap-4">
        {categories.map((category) => (
          <li key={category.id}>
            <Card className="flex flex-col gap-3 p-5">
              <CategoryForm category={category} />
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <ConfirmSubmit message="¿Borrar esta categoría? Solo se puede si no tiene productos." variant="ghost" size="sm">
                  Borrar
                </ConfirmSubmit>
              </form>
            </Card>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}
