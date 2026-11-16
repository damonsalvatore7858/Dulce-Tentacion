import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente público (clave anon, sin sesión). Solo lee lo que RLS permite al público.
// Devuelve null si faltan las variables de entorno: las páginas muestran un estado de error
// en lugar de romperse.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
