import { saveProduct } from "@/actions/admin/catalog";
import { Check, Field, selectClass, textareaClass } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VideoUploader } from "@/components/admin/video-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ProductValues = {
  id?: string;
  nombre?: string;
  nombre_en?: string | null;
  descripcion?: string | null;
  descripcion_en?: string | null;
  category_id?: string;
  video_url?: string | null;
  destacado?: boolean;
  activo?: boolean;
  es_ejemplo?: boolean;
};

export type SedeOption = {
  id: string;
  nombre: string;
  direccion?: string;
};

export type ProductPriceRow = {
  sede_id: string;
  precio_cop: number | null;
  disponible: boolean;
};

type Props = {
  values: ProductValues;
  categories: { id: string; nombre: string }[];
  sedes?: SedeOption[];
  prices?: ProductPriceRow[];
  initialImageUrl?: string | null;
  initialVideoUrl?: string | null;
};

export function ProductForm({
  values,
  categories,
  sedes = [],
  prices = [],
  initialImageUrl,
  initialVideoUrl,
}: Props) {
  const isEditing = Boolean(values.id);

  return (
    <form
      action={saveProduct}
      className="flex max-w-3xl flex-col gap-6"
    >
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      {/* 1. Datos básicos del producto */}
      <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl sm:text-2xl text-foreground">
          Información del producto
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="nombre" label="Nombre del producto">
            <Input
              id="nombre"
              name="nombre"
              required
              maxLength={120}
              placeholder="Ej. Waffle Frutos Rojos"
              defaultValue={values.nombre ?? ""}
            />
          </Field>
          <Field id="nombre_en" label="Nombre en inglés (opcional)">
            <Input
              id="nombre_en"
              name="nombre_en"
              maxLength={120}
              placeholder="Ej. Red Berries Waffle"
              defaultValue={values.nombre_en ?? ""}
            />
          </Field>
        </div>

        <Field id="category_id" label="Categoría">
          <select
            id="category_id"
            name="category_id"
            required
            className={selectClass}
            defaultValue={values.category_id ?? categories[0]?.id}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field id="descripcion" label="Descripción en español (opcional)">
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            maxLength={600}
            placeholder="Describe los ingredientes, textura o presentación..."
            defaultValue={values.descripcion ?? ""}
            className={textareaClass}
          />
        </Field>

        <Field id="descripcion_en" label="Descripción en inglés (opcional)">
          <textarea
            id="descripcion_en"
            name="descripcion_en"
            rows={2}
            maxLength={600}
            placeholder="English description..."
            defaultValue={values.descripcion_en ?? ""}
            className={textareaClass}
          />
        </Field>
      </section>

      {/* 2. Fotografía del producto en alta resolución */}
      <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl sm:text-2xl text-foreground">
            Fotografía del producto
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sube fotos nítidas para antojar a los clientes. Compatible con alta calidad (JPG, PNG o WebP hasta 10 MB).
          </p>
        </div>

        <ImageUploader
          initialImageUrl={initialImageUrl}
          inputName="file"
          removeInputName="remove_image"
        />
      </section>

      {/* 3. Video publicitario del producto (Opcional) */}
      <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl sm:text-2xl text-foreground">
            Video publicitario (Opcional)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sube un video corto tipo reel publicitario (MP4 o WebM hasta 25 MB) o pega un enlace de YouTube Shorts, Instagram Reel o TikTok.
          </p>
        </div>

        <VideoUploader
          initialVideoUrl={initialVideoUrl ?? values.video_url}
          inputName="video_url"
          fileInputName="video_file"
          removeInputName="remove_video"
        />
      </section>

      {/* 4. Precios y disponibilidad por sede */}
      {sedes.length > 0 ? (
        <section className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl sm:text-2xl text-foreground">
              Precios y disponibilidad por sede
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ingresa el precio en pesos colombianos para cada sede. Si lo dejas vacío, los clientes verán &quot;Consultar precio&quot;.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sedes.map((sede) => {
              const currentPrice = prices.find((p) => p.sede_id === sede.id);
              return (
                <div
                  key={sede.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-muted/40 p-4"
                >
                  <input type="hidden" name="sede_id" value={sede.id} />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-foreground">Sede {sede.nombre}</span>
                    {sede.direccion ? (
                      <span className="text-xs text-muted-foreground">{sede.direccion}</span>
                    ) : null}
                  </div>

                  <Field id={`precio_${sede.id}`} label="Precio (COP)">
                    <Input
                      id={`precio_${sede.id}`}
                      name={`precio_${sede.id}`}
                      inputMode="numeric"
                      placeholder="Ej. 18000"
                      defaultValue={currentPrice?.precio_cop ?? ""}
                    />
                  </Field>

                  <Check
                    name={`disp_${sede.id}`}
                    label="Disponible en esta sede"
                    defaultChecked={currentPrice?.disponible ?? true}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 4. Visibilidad y destacados */}
      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-xl sm:text-2xl text-foreground">
          Visibilidad en la carta
        </h2>
        <div className="flex flex-col gap-2">
          <Check
            name="activo"
            label="Visible en la carta digital"
            defaultChecked={values.activo ?? true}
          />
          <Check
            name="destacado"
            label="Destacar producto (se resalta en la portada y en su categoría)"
            defaultChecked={values.destacado ?? false}
          />
          <Check
            name="es_ejemplo"
            label="Marcar como dato de ejemplo (muestra etiqueta 'EJEMPLO')"
            defaultChecked={values.es_ejemplo ?? false}
          />
        </div>
      </section>

      {/* Botón de acción principal */}
      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" size="lg" className="px-8 shadow-sm font-bold">
          {isEditing ? "Guardar cambios del producto" : "Crear producto completo"}
        </Button>
      </div>
    </form>
  );
}
