import Link from "next/link";
import { createSede } from "@/actions/admin/sedes";
import { Field } from "@/components/admin/fields";
import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Sedes" };

export default async function SedesAdminPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("sedes").select("id, nombre, direccion, whatsapp, activa").order("orden");

  return (
    <PanelShell title="Sedes" intro="WhatsApp, horarios y datos de cada sede.">
      <Flash ok={ok} error={error} />
      <ul className="grid max-w-3xl gap-4">
        {(data ?? []).map((sede) => (
          <li key={sede.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <h2 className="font-display text-2xl">{sede.nombre}</h2>
                <p className="text-muted-foreground">{sede.direccion}</p>
                <div className="flex gap-2 pt-2">
                  <Badge variant={sede.activa ? "accent" : "outline"}>{sede.activa ? "Visible" : "Oculta"}</Badge>
                  <Badge>{sede.whatsapp ? "WhatsApp listo" : "Sin WhatsApp (muestra Pronto)"}</Badge>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/admin/sedes/${sede.id}`}>Editar</Link>
              </Button>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="max-w-3xl p-5">
        <h2 className="font-display text-2xl">Nueva sede</h2>
        <p className="pb-3 text-sm text-muted-foreground">Nace oculta: complétala y actívala cuando esté lista.</p>
        <form action={createSede} className="flex flex-col gap-3">
          <Field id="ns-nombre" label="Nombre">
            <Input id="ns-nombre" name="nombre" required maxLength={120} />
          </Field>
          <Field id="ns-dir" label="Dirección">
            <Input id="ns-dir" name="direccion" required maxLength={200} />
          </Field>
          <Button type="submit" className="self-start">
            Crear sede
          </Button>
        </form>
      </Card>
    </PanelShell>
  );
}
