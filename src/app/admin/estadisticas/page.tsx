import { PanelShell } from "@/components/admin/panel-shell";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CHANNEL_LABELS, type ClickChannel } from "@/lib/stats/channels";

export const metadata = { title: "Estadísticas" };

type Row = { dia: string; canal: ClickChannel; total: number; sedes: { nombre: string } | { nombre: string }[] | null };

function getSinceDate(): string {
  return new Date(Date.now() - 30 * 86_400_000 - 5 * 3_600_000).toISOString().slice(0, 10);
}

export default async function StatsPage() {
  const { supabase } = await requireAdmin();
  const since = getSinceDate();
  const { data } = await supabase
    .from("click_stats")
    .select("dia, canal, total, sedes(nombre)")
    .gte("dia", since);
  const rows = (data ?? []) as unknown as Row[];

  // Suma por sede y canal en los últimos 30 días.
  const totals = new Map<string, { sede: string; canal: ClickChannel; total: number }>();
  for (const row of rows) {
    const sede = (Array.isArray(row.sedes) ? row.sedes[0]?.nombre : row.sedes?.nombre) ?? "Sede";
    const key = `${sede}|${row.canal}`;
    const current = totals.get(key) ?? { sede, canal: row.canal, total: 0 };
    current.total += row.total;
    totals.set(key, current);
  }
  const list = [...totals.values()].sort((a, b) => a.sede.localeCompare(b.sede, "es") || b.total - a.total);

  return (
    <PanelShell title="Estadísticas" intro="Clics en los últimos 30 días. Son conteos anónimos: no guardamos quién hizo clic.">
      {list.length === 0 ? (
        <p className="rounded-card border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          Todavía no hay clics registrados.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-card">
          <table className="w-full min-w-[28rem] text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Sede</th>
                <th className="p-3">Botón</th>
                <th className="p-3 text-right">Clics</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={`${item.sede}-${item.canal}`} className="border-t border-border">
                  <td className="p-3">{item.sede}</td>
                  <td className="p-3">{CHANNEL_LABELS[item.canal] ?? item.canal}</td>
                  <td className="p-3 text-right font-extrabold">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelShell>
  );
}
