import Link from "next/link";
import { PanelShell } from "@/components/admin/panel-shell";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Resumen" };

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const count = async (table: string) => {
    const { count: total } = await supabase.from(table).select("id", { count: "exact", head: true });
    return total ?? 0;
  };
  const [products, sedes, promos] = await Promise.all([count("products"), count("sedes"), count("promotions")]);

  const cards = [
    { href: "/admin/productos", title: "Productos", text: `${products} en la carta. Precios, agotados e imágenes.` },
    { href: "/admin/categorias", title: "Categorías", text: "Waffles, cholados, copas…" },
    { href: "/admin/sedes", title: "Sedes", text: `${sedes} sedes. WhatsApp, horarios y datos.` },
    { href: "/admin/promociones", title: "Promociones", text: `${promos} creadas. Con fechas de vigencia.` },
    { href: "/admin/ajustes", title: "Ajustes", text: "Producto del momento, banner y módulos." },
    { href: "/admin/historial", title: "Historial", text: "Quién cambió qué y cuándo." },
  ];

  return (
    <PanelShell title="Bienvenida" intro="Elige qué quieres editar. Los cambios se ven en el sitio al guardar.">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className="block h-full">
              <Card className="h-full p-5 transition-transform duration-200 hover:-translate-y-1">
                <h2 className="font-display text-2xl text-primary">{card.title}</h2>
                <p className="pt-1 text-muted-foreground">{card.text}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}
