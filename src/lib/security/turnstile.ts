import "server-only";
import { isProductionDeploy } from "@/lib/security/env";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Verifica el token de Cloudflare Turnstile en el servidor.
// Sin clave secreta: solo se permite en local y previews; en producción se rechaza.
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Si no hay clave secreta: en producción se rechaza por seguridad; en desarrollo/preview se permite
  if (!secret) {
    return !isProductionDeploy;
  }

  // Claves de prueba de Cloudflare Turnstile
  if (
    secret.startsWith("1x000000") ||
    secret.startsWith("2x000000") ||
    secret.startsWith("3x000000")
  ) {
    return true;
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
