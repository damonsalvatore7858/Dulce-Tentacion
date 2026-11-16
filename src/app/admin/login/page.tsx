import { login } from "@/actions/admin/auth";
import { Flash } from "@/components/admin/flash";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERRORS: Record<string, string> = {
  datos: "Escribe tu correo y tu contraseña.",
  credenciales: "Correo o contraseña incorrectos.",
  intentos: "Demasiados intentos. Espera unos minutos.",
  config: "El panel no está configurado todavía.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Logo />
      <h1 className="font-display text-4xl text-primary">Panel de administración</h1>
      {error ? (
        <p role="alert" className="rounded-field bg-destructive px-4 py-3 font-bold text-destructive-foreground">
          {ERRORS[error] ?? "No se pudo iniciar sesión."}
        </p>
      ) : null}
      <form action={login} className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" maxLength={200} />
        </div>
        <Button type="submit" size="lg">
          Entrar
        </Button>
      </form>
      <Flash />
    </main>
  );
}
