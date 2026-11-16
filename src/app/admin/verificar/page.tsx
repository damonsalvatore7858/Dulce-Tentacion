import { verifyMfaLogin } from "@/actions/admin/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/lib/auth/require-admin";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <h1 className="font-display text-4xl text-primary">Verificación en dos pasos</h1>
      <p className="text-muted-foreground">Escribe el código de 6 dígitos que muestra tu app de autenticación.</p>
      {error ? (
        <p role="alert" className="rounded-field bg-destructive px-4 py-3 font-bold text-destructive-foreground">
          {error === "intentos" ? "Demasiados intentos. Espera unos minutos." : "El código no es correcto."}
        </p>
      ) : null}
      <form action={verifyMfaLogin} className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Código</Label>
          <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
        </div>
        <Button type="submit" size="lg">
          Verificar
        </Button>
      </form>
    </main>
  );
}
