import { notFound } from "next/navigation";
import { z } from "zod";
import { saveSede } from "@/actions/admin/sedes";
import { Check, Field } from "@/components/admin/fields";
import { Flash } from "@/components/admin/flash";
import { PanelShell } from "@/components/admin/panel-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Sede } from "@/lib/data/types";
import { DAYS } from "@/lib/validation/admin";

export const metadata = { title: "Editar sede" };

const DAY_NAMES: Record<(typeof DAYS)[number], string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
};

export default async function EditSedePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ok, error } = await searchParams;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("sedes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const sede = data as Sede & { activa: boolean };

  return (
    <PanelShell title={sede.nombre}>
      <Flash ok={ok} error={error} />
      <form action={saveSede} className="flex max-w-2xl flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <input type="hidden" name="id" value={sede.id} />
        <Field id="nombre" label="Nombre">
          <Input id="nombre" name="nombre" required maxLength={120} defaultValue={sede.nombre} />
        </Field>
        <Field id="direccion" label="Dirección">
          <Input id="direccion" name="direccion" required maxLength={200} defaultValue={sede.direccion} />
        </Field>
        <Field id="barrio" label="Barrio">
          <Input id="barrio" name="barrio" maxLength={80} defaultValue={sede.barrio ?? ""} />
        </Field>
        <Field id="whatsapp" label="WhatsApp" hint="Escríbelo como quieras: 301 743 0183. Vacío = el sitio muestra 'Pronto'.">
          <Input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={sede.whatsapp ? sede.whatsapp.slice(2) : ""} />
        </Field>
        <Field id="telefono" label="Teléfono (opcional)">
          <Input id="telefono" name="telefono" inputMode="tel" maxLength={20} defaultValue={sede.telefono ?? ""} />
        </Field>
        <Field id="maps_url" label="Enlace de Google Maps (opcional)" hint="Si lo dejas vacío, el sitio lo arma con la dirección.">
          <Input id="maps_url" name="maps_url" type="url" maxLength={500} defaultValue={sede.maps_url ?? ""} />
        </Field>
        <Field id="maps_embed_url" label="Enlace para el mapa incrustado (opcional)">
          <Input id="maps_embed_url" name="maps_embed_url" type="url" maxLength={800} defaultValue={sede.maps_embed_url ?? ""} />
        </Field>
        <Field id="horario_nota" label="Nota de horario">
          <Input id="horario_nota" name="horario_nota" maxLength={200} defaultValue={sede.horario_nota ?? ""} />
        </Field>
        <Field id="horario_nota_en" label="Nota de horario en inglés (opcional)">
          <Input id="horario_nota_en" name="horario_nota_en" maxLength={200} defaultValue={sede.horario_nota_en ?? ""} />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 font-bold">Horario semanal</legend>
          <p className="text-sm text-muted-foreground">Deja vacío un día si no hay horario cargado. Si cargas alguno, los vacíos se muestran como cerrados.</p>
          {DAYS.map((day) => {
            const slot = sede.horarios?.[day]?.[0];
            return (
              <div key={day} className="grid grid-cols-[6rem_1fr_1fr] items-center gap-2">
                <span className="font-bold">{DAY_NAMES[day]}</span>
                <Input name={`abre_${day}`} type="time" aria-label={`${DAY_NAMES[day]}: abre`} defaultValue={slot?.abre ?? ""} />
                <Input name={`cierra_${day}`} type="time" aria-label={`${DAY_NAMES[day]}: cierra`} defaultValue={slot?.cierra ?? ""} />
              </div>
            );
          })}
        </fieldset>

        <Field id="orden" label="Orden" hint="Más bajo = aparece primero">
          <Input id="orden" name="orden" type="number" min={0} max={99} required defaultValue={sede.orden} />
        </Field>
        <Check name="domicilios" label="Hace domicilios" defaultChecked={sede.domicilios} />
        <Check name="activa" label="Visible en el sitio" defaultChecked={sede.activa} />
        <Button type="submit" size="lg" className="self-start">
          Guardar sede
        </Button>
      </form>
    </PanelShell>
  );
}
