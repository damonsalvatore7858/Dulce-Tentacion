import { saveProduct } from "@/actions/admin/catalog";
import { Check, Field, selectClass, textareaClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProductValues = {
  id?: string;
  nombre?: string;
  nombre_en?: string | null;
  descripcion?: string | null;
  descripcion_en?: string | null;
  category_id?: string;
  destacado?: boolean;
  activo?: boolean;
  es_ejemplo?: boolean;
};

export function ProductForm({ values, categories }: { values: ProductValues; categories: { id: string; nombre: string }[] }) {
  return (
    <form action={saveProduct} className="flex max-w-2xl flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <Field id="nombre" label="Nombre">
        <Input id="nombre" name="nombre" required maxLength={120} defaultValue={values.nombre ?? ""} />
      </Field>
      <Field id="nombre_en" label="Nombre en inglés (opcional)">
        <Input id="nombre_en" name="nombre_en" maxLength={120} defaultValue={values.nombre_en ?? ""} />
      </Field>
      <Field id="category_id" label="Categoría">
        <select id="category_id" name="category_id" required className={selectClass} defaultValue={values.category_id ?? categories[0]?.id}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>
      </Field>
      <Field id="descripcion" label="Descripción (opcional)">
        <textarea id="descripcion" name="descripcion" rows={3} maxLength={600} defaultValue={values.descripcion ?? ""} className={textareaClass} />
      </Field>
      <Field id="descripcion_en" label="Descripción en inglés (opcional)">
        <textarea id="descripcion_en" name="descripcion_en" rows={3} maxLength={600} defaultValue={values.descripcion_en ?? ""} className={textareaClass} />
      </Field>
      <Check name="activo" label="Visible en el sitio" defaultChecked={values.activo ?? true} />
      <Check name="destacado" label="Destacado" defaultChecked={values.destacado ?? false} />
      <Check name="es_ejemplo" label="Es un dato de ejemplo (se marca EJEMPLO en la carta)" defaultChecked={values.es_ejemplo ?? false} />
      <Button type="submit" size="lg" className="self-start">
        Guardar producto
      </Button>
    </form>
  );
}
