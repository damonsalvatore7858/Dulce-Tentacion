import Link from "next/link";
import { toggleAvailability, toggleProductActive } from "@/actions/admin/catalog";
import { Flash } from "@/components/admin/flash";
import { PanelShell, type FlashParams } from "@/components/admin/panel-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatCOP } from "@/lib/format/cop";

export const metadata = { title: "Productos" };

type ProductRow = { id: string; nombre: string; activo: boolean; es_ejemplo: boolean; categories: { nombre: string } | { nombre: string }[] | null };
type PriceRow = { product_id: string; sede_id: string; precio_cop: number | null; disponible: boolean };
type SedeRow = { id: string; nombre: string };

export default async function ProductsPage({ searchParams }: FlashParams) {
  const { ok, error } = await searchParams;
  const { supabase } = await requireAdmin();

  const [products, prices, sedes] = await Promise.all([
    supabase.from("products").select("id, nombre, activo, es_ejemplo, categories(nombre)").order("nombre"),
    supabase.from("product_prices").select("product_id, sede_id, precio_cop, disponible"),
    supabase.from("sedes").select("id, nombre").order("orden"),
  ]);
  const productRows = (products.data ?? []) as unknown as ProductRow[];
  const priceRows = (prices.data ?? []) as PriceRow[];
  const sedeRows = (sedes.data ?? []) as SedeRow[];

  return (
    <PanelShell title="Productos" intro="Activa o desactiva productos y márcalos como agotados al instante.">
      <Flash ok={ok} error={error} />
      <Button asChild className="self-start">
        <Link href="/admin/productos/nuevo">Agregar producto</Link>
      </Button>

      <ul className="flex flex-col gap-4">
        {productRows.map((product) => {
          const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
          return (
            <li key={product.id}>
              <Card className="flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-2xl">{product.nombre}</h2>
                    {category ? <Badge>{category.nombre}</Badge> : null}
                    {product.es_ejemplo ? <Badge variant="example">EJEMPLO</Badge> : null}
                    {!product.activo ? <Badge variant="outline">Oculto en el sitio</Badge> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/productos/${product.id}`}>Editar</Link>
                    </Button>
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="value" value={String(!product.activo)} />
                      <Button type="submit" size="sm" variant="ghost">
                        {product.activo ? "Ocultar" : "Mostrar"}
                      </Button>
                    </form>
                  </div>
                </div>
                <ul className="flex flex-col gap-2">
                  {sedeRows.map((sede) => {
                    const price = priceRows.find((row) => row.product_id === product.id && row.sede_id === sede.id);
                    if (!price) return null;
                    return (
                      <li key={sede.id} className="flex flex-wrap items-center justify-between gap-2 rounded-field bg-muted px-4 py-2">
                        <span>
                          <strong>{sede.nombre}:</strong>{" "}
                          {price.precio_cop === null ? "Consultar precio" : formatCOP(price.precio_cop)}
                          {!price.disponible ? " · Agotado" : ""}
                        </span>
                        <form action={toggleAvailability}>
                          <input type="hidden" name="product_id" value={product.id} />
                          <input type="hidden" name="sede_id" value={sede.id} />
                          <input type="hidden" name="value" value={String(!price.disponible)} />
                          <Button type="submit" size="sm" variant={price.disponible ? "secondary" : "accent"}>
                            {price.disponible ? "Marcar agotado" : "Volver a disponible"}
                          </Button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </li>
          );
        })}
      </ul>
    </PanelShell>
  );
}
