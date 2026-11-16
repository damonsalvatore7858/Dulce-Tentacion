import { deletePromo, savePromo } from "@/actions/admin/promos";
import { Check, Field, selectClass, textareaClass } from "@/components/admin/fields";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Promociones" };

type Promo = {
  id: string;
  titulo: string;
  titulo_en: string | null;
  texto: string | null;
  texto_en: string | null;
  sede_id: string | null;
  desde: string;
  hasta: string;
  activa: boolean;
};

// ISO (UTC) -> valor de <input type="datetime-local"> en hora de Colombia (UTC-5).
function toColombiaInput(iso: string): string {
  return new Date(new Date(iso).getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

function getDefaultPromoDates(promo?: Promo) {
  const now = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const defaultFrom = promo ? toColombiaInput(promo.desde) : now.toISOString().slice(0, 16);
  const defaultTo = promo ? toColombiaInput(promo.hasta) : new Date(now.getTime() + 7 * 86_400_000).toISOString().slice(0, 16);
  return { defaultFrom, defaultTo };
}

function PromoForm({ promo, sedes }: { promo?: Promo; sedes: { id: string; nombre: string }[] }) {
  const key = promo?.id ?? "nueva";
  const { defaultFrom, defaultTo } = getDefaultPromoDates(promo);

  return (
    <form action={savePromo} className="flex flex-col gap-3">
      {promo ? <input type="hidden" name="id" value={promo.id} /> : null}
      <Field id={`t-${key}`} label="Título">
        <Input id={`t-${key}`} name="titulo" required maxLength={120} defaultValue={promo?.titulo ?? ""} />
      </Field>
      <Field id={`te-${key}`} label="Título en inglés (opcional)">
        <Input id={`te-${key}`} name="titulo_en" maxLength={120} defaultValue={promo?.titulo_en ?? ""} />
      </Field>
      <Field id={`x-${key}`} label="Texto (opcional)">
        <textarea id={`x-${key}`} name="texto" rows={2} maxLength={400} defaultValue={promo?.texto ?? ""} className={textareaClass} />
      </Field>
      <Field id={`xe-${key}`} label="Texto en inglés (opcional)">
        <textarea id={`xe-${key}`} name="texto_en" rows={2} maxLength={400} defaultValue={promo?.texto_en ?? ""} className={textareaClass} />
      </Field>
      <Field id={`s-${key}`} label="Sede">
        <select id={`s-${key}`} name="sede_id" className={selectClass} defaultValue={promo?.sede_id ?? ""}>
          <option value="">Todas las sedes</option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`d-${key}`} label="Desde">
          <Input id={`d-${key}`} name="desde" type="datetime-local" required defaultValue={defaultFrom} />
        </Field>
        <Field id={`h-${key}`} label="Hasta">
          <Input id={`h-${key}`} name="hasta" type="datetime-local" required defaultValue={defaultTo} />
        </Field>
      </div>
      <Check name="activa" label="Activa" defaultChecked={promo?.activa ?? true} />
      <Button type="submit" size="sm" className="self-start">
        {promo ? "Guardar" : "Crear promoción"}
      </Button>
    </form>
  );
}

export default async function PromosPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const [promos, sedes] = await Promise.all([
    supabase.from("promotions").select("*").order("desde", { ascending: false }),
    supabase.from("sedes").select("id, nombre").order("orden"),
  ]);

  return (
    <PanelShell title="Promociones" intro="Aparecen en el inicio solo mientras estén activas y dentro de sus fechas.">
      <Flash ok={ok} error={error} />
      <Card className="max-w-2xl p-5">
        <h2 className="pb-3 font-display text-2xl">Nueva promoción</h2>
        <PromoForm sedes={sedes.data ?? []} />
      </Card>
      <ul className="flex max-w-2xl flex-col gap-4">
        {((promos.data ?? []) as Promo[]).map((promo) => (
          <li key={promo.id}>
            <Card className="flex flex-col gap-3 p-5">
              <PromoForm promo={promo} sedes={sedes.data ?? []} />
              <form action={deletePromo}>
                <input type="hidden" name="id" value={promo.id} />
                <ConfirmSubmit message="¿Borrar esta promoción?" variant="ghost" size="sm">
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
