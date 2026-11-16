import { MfaEnroll } from "@/components/admin/mfa-enroll";
import { PanelShell } from "@/components/admin/panel-shell";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = { title: "Seguridad" };

export default async function SecurityPage() {
  const { supabase, user } = await requireAdmin();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const active = (factors?.totp ?? []).some((factor) => factor.status === "verified");

  return (
    <PanelShell title="Seguridad" intro="Protege tu cuenta con un segundo paso al iniciar sesión.">
      <p>
        Sesión: <strong>{user.email}</strong>
      </p>
      {active ? (
        <p role="status" className="rounded-field bg-accent px-4 py-3 font-bold text-accent-foreground">
          La verificación en dos pasos está activa.
        </p>
      ) : (
        <MfaEnroll />
      )}
    </PanelShell>
  );
}
