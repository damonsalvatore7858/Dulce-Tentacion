"use client";

import { Button } from "@/components/ui/button";

// Error genérico: sin detalles técnicos para el visitante (van a los logs del servidor).
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section role="alert" className="page-container section-y flex flex-col items-center gap-4 text-center">
      <h1 className="font-display text-4xl text-primary">Algo salió mal</h1>
      <p className="text-muted-foreground">
        Tuvimos un problema al cargar esta página. / We had a problem loading this page.
      </p>
      <Button onClick={() => reset()} size="lg">
        Intentar de nuevo / Try again
      </Button>
    </section>
  );
}
