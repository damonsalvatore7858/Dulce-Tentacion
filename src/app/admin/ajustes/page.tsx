import { saveBanner, saveModulos, saveMomento } from "@/actions/admin/settings";
import { Check, Field, selectClass } from "@/components/admin/fields";
import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseBanner, parseModulos } from "@/lib/data/queries";

export const metadata = { title: "Ajustes" };

export default async function SettingsPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();

  const [settingsResult, products] = await Promise.all([
    supabase.from("site_settings").select("clave, valor"),
    supabase.from("products").select("id, nombre").order("nombre"),
  ]);
  const settings: Record<string, unknown> = {};
  for (const row of (settingsResult.data ?? []) as { clave: string; valor: unknown }[]) settings[row.clave] = row.valor;

  const banner = parseBanner(settings);
  const modulos = parseModulos(settings);
  const moment = settings.producto_del_momento as { product_id?: string; activo?: boolean } | undefined;
  const currentMoment = moment?.activo ? (moment.product_id ?? "") : "";

  return (
    <PanelShell title="Ajustes" intro="Producto del momento, banner de avisos y módulos del sitio.">
      <Flash ok={ok} error={error} />

      <Card className="max-w-2xl p-5">
        <h2 className="pb-3 font-display text-2xl">Producto del momento</h2>
        <form action={saveMomento} className="flex flex-col gap-3">
          <Field id="product_id" label="Producto destacado en el inicio">
            <select id="product_id" name="product_id" className={selectClass} defaultValue={currentMoment}>
              <option value="">Ninguno</option>
              {(products.data ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" size="sm" className="self-start">
            Guardar
          </Button>
        </form>
      </Card>

      <Card className="max-w-2xl p-5">
        <h2 className="pb-3 font-display text-2xl">Banner de avisos</h2>
        <form action={saveBanner} className="flex flex-col gap-3">
          <Field id="texto_es" label="Texto en español">
            <Input id="texto_es" name="texto_es" maxLength={300} defaultValue={banner.texto_es} />
          </Field>
          <Field id="texto_en" label="Texto en inglés">
            <Input id="texto_en" name="texto_en" maxLength={300} defaultValue={banner.texto_en} />
          </Field>
          <Check name="activo" label="Mostrar el banner en el inicio" defaultChecked={banner.activo} />
          <Button type="submit" size="sm" className="self-start">
            Guardar
          </Button>
        </form>
      </Card>

      <Card className="max-w-2xl p-5">
        <h2 className="pb-3 font-display text-2xl">Módulos</h2>
        <form action={saveModulos} className="flex flex-col gap-3">
          <Check name="reservas" label="Reservas" defaultChecked={modulos.reservas} />
          <Check name="eventos" label="Eventos y pedidos por encargo" defaultChecked={modulos.eventos} />
          <Button type="submit" size="sm" className="self-start">
            Guardar
          </Button>
        </form>
      </Card>
    </PanelShell>
  );
}
