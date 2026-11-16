import Link from "next/link";
import { logout } from "@/actions/admin/auth";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/sedes", label: "Sedes" },
  { href: "/admin/promociones", label: "Promociones" },
  { href: "/admin/ajustes", label: "Ajustes" },
  { href: "/admin/estadisticas", label: "Estadísticas" },
  { href: "/admin/historial", label: "Historial" },
  { href: "/admin/seguridad", label: "Seguridad" },
];

export function AdminNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="page-container flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/admin" aria-label="Inicio del panel">
          <Logo />
        </Link>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Salir
          </Button>
        </form>
      </div>
      <nav aria-label="Panel" className="page-container flex flex-wrap gap-1 pb-3">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-pill px-4 py-2 text-sm font-bold hover:bg-muted"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
