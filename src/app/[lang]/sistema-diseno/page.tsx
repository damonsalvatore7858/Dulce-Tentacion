import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/menu/product-card";
import { Price } from "@/components/menu/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  robots: { index: false, follow: false },
};

const SWATCHES = [
  { name: "background", cls: "bg-background text-foreground" },
  { name: "card", cls: "bg-card text-card-foreground" },
  { name: "muted", cls: "bg-muted text-foreground" },
  { name: "primary", cls: "bg-primary text-primary-foreground" },
  { name: "secondary", cls: "bg-secondary text-secondary-foreground" },
  { name: "accent", cls: "bg-accent text-accent-foreground" },
  { name: "destructive", cls: "bg-destructive text-destructive-foreground" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-3xl text-primary">{title}</h2>
      {children}
    </section>
  );
}

// Página de revisión visual. No se muestra en producción (VERCEL_ENV=production) ni se indexa.
export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { common } = getDictionary(lang);
  const labels = {
    consultPrice: common.consultPrice,
    soldOut: common.soldOut,
    example: common.example,
  };

  return (
    <div className="page-container section-y flex flex-col gap-14">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-5xl text-primary text-neon">Sistema de diseño</h1>
        <p className="text-muted-foreground">
          Revisión visual de tokens y componentes. Cambia entre claro y oscuro con el botón del
          encabezado.
        </p>
      </header>

      <Section title="Colores">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((swatch) => (
            <li
              key={swatch.name}
              className={`flex h-24 items-end rounded-card border border-border p-3 text-sm font-bold ${swatch.cls}`}
            >
              {swatch.name}
            </li>
          ))}
        </ul>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <li className="flex h-16 items-end rounded-card bg-brand-pink p-3 text-sm font-bold text-brand-choco">
            brand-pink
          </li>
          <li className="flex h-16 items-end rounded-card bg-brand-blue p-3 text-sm font-bold text-brand-choco">
            brand-blue
          </li>
          <li className="flex h-16 items-end rounded-card bg-brand-choco p-3 text-sm font-bold text-white">
            brand-choco
          </li>
          <li className="flex h-16 items-end rounded-card bg-brand-pastel p-3 text-sm font-bold text-brand-choco">
            brand-pastel
          </li>
        </ul>
      </Section>

      <Section title="Tipografía">
        <p className="font-display text-4xl">Pacifico: títulos y destacados</p>
        <p className="text-lg">Nunito: texto de lectura, ñ, á, é, í, ó, ú. Antojo, es un momento para ti.</p>
        <p className="text-sm text-muted-foreground">Texto secundario con contraste AA.</p>
      </Section>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="accent">Acento</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Fantasma</Button>
          <Button variant="link">Enlace</Button>
          <Button disabled>Deshabilitado</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeño</Button>
          <Button size="lg">Grande</Button>
        </div>
      </Section>

      <Section title="Insignias y precios">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Por defecto</Badge>
          <Badge variant="primary">Primaria</Badge>
          <Badge variant="accent">Acento</Badge>
          <Badge variant="outline">Contorno</Badge>
          <Badge variant="example">{common.example}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Price value={18000} consultLabel={common.consultPrice} />
          <Price value={null} consultLabel={common.consultPrice} />
          <Price value={18000} consultLabel={common.consultPrice} muted />
        </div>
      </Section>

      <Section title="Formulario">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Tu nombre</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Label htmlFor="demo-nombre">Nombre</Label>
            <Input id="demo-nombre" placeholder="Escribe tu nombre" autoComplete="off" />
            <Label htmlFor="demo-error" className="mt-2">Campo con error</Label>
            <Input id="demo-error" aria-invalid="true" defaultValue="Valor no válido" />
          </CardContent>
        </Card>
      </Section>

      <Section title="Tarjetas de producto (demo de componente)">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <ProductCard
              name="Copa gigante de fresas con chantillí de chocolate"
              priceCop={18000}
              available
              highlighted
              labels={labels}
            />
          </li>
          <li>
            <ProductCard
              name="Waffle selva negra"
              priceCop={null}
              available
              labels={labels}
            />
          </li>
          <li>
            <ProductCard
              name="Producto de ejemplo"
              description="Texto de muestra para ver cómo se ve una descripción."
              priceCop={15000}
              available={false}
              isExample
              labels={labels}
            />
          </li>
        </ul>
      </Section>

      <Section title="Estado de carga">
        <div aria-busy="true" className="grid max-w-md gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </Section>
    </div>
  );
}
