import { ExternalLink, Film, Plus, Trash2, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { deleteShowcaseVideo, saveShowcaseVideo, toggleShowcaseVideo } from "@/actions/admin/videos";
import { Check, Field } from "@/components/admin/fields";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { VideoUploader } from "@/components/admin/video-uploader";
import { ProductVideoPlayer } from "@/components/media/product-video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseShowcaseVideos, publicImageUrl } from "@/lib/data/queries";

export const metadata = { title: "Videos Publicitarios" };

export default async function AdminVideosPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();

  const [settingsResult, productsResult] = await Promise.all([
    supabase.from("site_settings").select("clave, valor"),
    supabase.from("products").select("id, nombre, image_path, video_url, categories(nombre)").order("nombre"),
  ]);

  const settings: Record<string, unknown> = {};
  for (const row of (settingsResult.data ?? []) as { clave: string; valor: unknown }[]) {
    settings[row.clave] = row.valor;
  }

  const showcaseVideos = parseShowcaseVideos(settings);
  const products = productsResult.data ?? [];
  const productsWithVideo = products.filter((p) => p.video_url);

  return (
    <PanelShell
      title="Videos Publicitarios"
      intro="Administra los videos promocionales de la portada y los videos asociados a cada producto del catálogo."
    >
      <Flash ok={ok} error={error} />

      {/* SECCIÓN 1: Videos de la Portada */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-foreground">
            1. Videos de la Portada (Vitrina Principal)
          </h2>
          <p className="text-sm text-muted-foreground">
            Los videos activos aquí se muestran en la sección &quot;Mira cómo preparamos tu antojo&quot; de la página de inicio. Si no agregas ninguno, la sección no se mostrará.
          </p>
        </div>

        {/* Lista de videos configurados en la portada */}
        {showcaseVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-4xl">
            {showcaseVideos.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between overflow-hidden p-4 gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <Badge variant={item.active ? "accent" : "outline"} className="text-[0.7rem]">
                      {item.active ? "Activo en portada" : "Pausado"}
                    </Badge>
                  </div>

                  {item.subtitle ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.subtitle}
                    </p>
                  ) : null}

                  {/* Reproductor de prueba */}
                  <div className="pt-1">
                    <ProductVideoPlayer
                      videoUrl={item.videoUrl}
                      title={item.title}
                      aspect="video"
                      className="max-h-48 rounded-xl"
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <form action={toggleShowcaseVideo}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="active" value={item.active ? "false" : "true"} />
                    <Button type="submit" variant="ghost" size="sm" className="text-xs">
                      {item.active ? "Pausar video" : "Activar en portada"}
                    </Button>
                  </form>

                  <form action={deleteShowcaseVideo}>
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmit
                      message={`¿Eliminar el video "${item.title}" de la portada?`}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                      Eliminar
                    </ConfirmSubmit>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl p-6 text-center text-muted-foreground">
            <Film className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold">
              Todavía no has agregado ningún video publicitario a la portada.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Usa el formulario a continuación para agregar tu primer video (subiendo un archivo MP4 o pegando un enlace de Instagram/YouTube).
            </p>
          </Card>
        )}

        {/* Formulario para agregar / reemplazar video en la portada */}
        <Card className="max-w-3xl p-6">
          <h3 className="font-display text-xl text-foreground mb-1 inline-flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Agregar nuevo video a la portada
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Ingresa el título, descripción y sube el archivo de video o pega el enlace de tu red social.
          </p>

          <form action={saveShowcaseVideo} className="flex flex-col gap-4">
            <Field id="title" label="Título del video publicitario">
              <Input
                id="title"
                name="title"
                required
                maxLength={120}
                placeholder="Ej. Waffles artesanales recién horneados"
              />
            </Field>

            <Field id="subtitle" label="Descripción o mensaje (opcional)">
              <Input
                id="subtitle"
                name="subtitle"
                maxLength={300}
                placeholder="Ej. Crocantes por fuera, suaves por dentro con frutas frescas y helado."
              />
            </Field>

            <Field id="target_href" label="Enlace al hacer clic en el botón (opcional)">
              <Input
                id="target_href"
                name="target_href"
                maxLength={200}
                defaultValue="/carta"
                placeholder="Ej. /carta o /carta/belen"
              />
            </Field>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-sm font-bold text-foreground">Video publicitario</span>
              <VideoUploader
                inputName="video_url"
                fileInputName="video_file"
                removeInputName="remove_video"
              />
            </div>

            <Check name="active" label="Mostrar inmediatamente en la portada" defaultChecked={true} />

            <div className="pt-2">
              <Button type="submit" size="lg" className="font-bold">
                Guardar video de portada
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* SECCIÓN 2: Videos de Productos del Catálogo */}
      <section className="flex flex-col gap-4 pt-8 border-t border-border/80">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl text-foreground">
            2. Videos en Productos del Catálogo ({productsWithVideo.length} de {products.length} productos con video)
          </h2>
          <p className="text-sm text-muted-foreground">
            Cada producto puede tener su propio video publicitario. Los clientes verán la insignia &quot;▶ Video&quot; en la carta digital.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft max-w-4xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground font-bold">
                <tr>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Estado del Video</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((product) => {
                  const image = publicImageUrl(product.image_path);
                  const hasVideo = Boolean(product.video_url);

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted">
                          {image ? (
                            <Image src={image} alt={product.nombre} fill className="object-cover" sizes="44px" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                              🍦
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-foreground">{product.nombre}</span>
                      </td>

                      <td className="p-3.5 text-muted-foreground">
                        {Array.isArray(product.categories)
                          ? product.categories[0]?.nombre
                          : (product.categories as { nombre?: string } | null)?.nombre ?? "—"}
                      </td>

                      <td className="p-3.5">
                        {hasVideo ? (
                          <Badge variant="accent" className="font-bold">
                            <Video className="size-3" />
                            Con video asignado
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin video</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <Button asChild variant="outline" size="sm" className="text-xs font-bold">
                          <Link href={`/admin/productos/${product.id}`}>
                            {hasVideo ? "Cambiar video" : "Asignar video"}
                            <ExternalLink className="size-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PanelShell>
  );
}
