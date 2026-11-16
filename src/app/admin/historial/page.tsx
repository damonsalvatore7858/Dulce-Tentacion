import { PanelShell } from "@/components/admin/panel-shell";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Historial" };

type Row = {
  id: number;
  actor_id: string | null;
  tabla: string;
  accion: "INSERT" | "UPDATE" | "DELETE";
  antes: Record<string, unknown> | null;
  despues: Record<string, unknown> | null;
  at: string;
};

const TABLES: Record<string, string> = {
  sedes: "Sedes",
  categories: "Categorías",
  products: "Productos",
  product_prices: "Precios",
  promotions: "Promociones",
  site_settings: "Ajustes",
  profiles: "Perfiles",
};
const ACTIONS = { INSERT: "Creó", UPDATE: "Cambió", DELETE: "Borró" } as const;

function summary(row: Row): string {
  const data = row.despues ?? row.antes ?? {};
  for (const key of ["nombre", "titulo", "clave"]) {
    if (typeof data[key] === "string") return data[key] as string;
  }
  if (row.tabla === "product_prices" && "precio_cop" in data) {
    return data.precio_cop === null ? "precio: consultar" : `precio: ${String(data.precio_cop)}`;
  }
  return "";
}

export default async function HistoryPage() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("audit_log").select("*").order("at", { ascending: false }).limit(100);
  const rows = (data ?? []) as Row[];

  return (
    <PanelShell title="Historial" intro="Los últimos 100 cambios: quién, cuándo y qué.">
      <div className="overflow-x-auto rounded-card border border-border bg-card">
        <table className="w-full min-w-[36rem] text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Quién</th>
              <th className="p-3">Qué</th>
              <th className="p-3">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap">
                  {new Date(row.at).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="p-3">{row.actor_id === user.id ? "Tú" : row.actor_id ? row.actor_id.slice(0, 8) : "Sistema"}</td>
                <td className="p-3">
                  {ACTIONS[row.accion]} · {TABLES[row.tabla] ?? row.tabla}
                </td>
                <td className="p-3 text-muted-foreground">{summary(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>
  );
}
