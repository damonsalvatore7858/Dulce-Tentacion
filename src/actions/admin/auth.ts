"use server";

import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-admin";
import { loginSchema, mfaCodeSchema } from "@/lib/validation/admin";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/login?error=datos");

  const limit = await checkRateLimit("login");
  if (limit !== "ok") redirect("/admin/login?error=intentos");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Mismo mensaje genérico para credenciales malas y para usuarios sin rol admin.
  if (error) redirect("/admin/login?error=credenciales");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=credenciales");
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Segundo factor al iniciar sesión.
export async function verifyMfaLogin(formData: FormData) {
  const { supabase } = await requireUser();
  const code = mfaCodeSchema.safeParse(formData.get("code"));
  if (!code.success) redirect("/admin/verificar?error=codigo");

  const limit = await checkRateLimit("login");
  if (limit !== "ok") redirect("/admin/verificar?error=intentos");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((item) => item.status === "verified");
  if (!factor) redirect("/admin");

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challengeError || !challenge) redirect("/admin/verificar?error=codigo");

  const { error } = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.id,
    code: code.data,
  });
  if (error) redirect("/admin/verificar?error=codigo");
  redirect("/admin");
}

type EnrollResult =
  | { ok: true; factorId: string; qr: string; secret: string }
  | { ok: false };

// Paso 1 de activar 2FA: genera el QR para la app de autenticación.
export async function startMfaEnroll(): Promise<EnrollResult> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Autenticador ${Date.now()}`,
  });
  if (error || !data) return { ok: false };
  return { ok: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

// Paso 2: confirma con el primer código de 6 dígitos.
export async function confirmMfaEnroll(factorId: string, code: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireUser();
  const parsedCode = mfaCodeSchema.safeParse(code);
  if (!parsedCode.success || !/^[0-9a-f-]{36}$/i.test(factorId)) return { ok: false };

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError || !challenge) return { ok: false };

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: parsedCode.data,
  });
  return { ok: !error };
}
