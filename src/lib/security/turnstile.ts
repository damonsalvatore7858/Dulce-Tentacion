import "server-only";
import { isProductionDeploy } from "@/lib/security/env";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Verifica el token de Cloudflare Turnstile en el servidor.
// Sin clave secreta: solo se permite en local y previews; en producción se rechaza.
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (!isProductionDeploy) {
      console.warn("[security] TURNSTILE_SECRET_KEY no configurada: verificación omitida (solo desarrollo)");
      return true;
    }
    return false;
  }
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) return false;
    const json = (await response.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    console.error("[security] turnstile verify error");
    return false;
  }
}
