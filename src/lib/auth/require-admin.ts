import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Verificación EN SERVIDOR en cada página y cada acción. El rol lo decide la base de datos
// (función is_admin), no el navegador. Esconder un botón NO es protección.

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=credenciales");
  }
  return { supabase, user };
}

// Además exige el segundo factor (2FA) si la cuenta lo tiene activado.
export async function requireAdmin() {
  const context = await requireUser();
  const { data: aal } = await context.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect("/admin/verificar");
  }
  return context;
}
