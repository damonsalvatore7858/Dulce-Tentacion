import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la clave de servicio (service_role): SOLO servidor y SOLO para tareas puntuales
// que RLS no permite al público (aquí: sumar clics). Nunca se importa desde código de cliente.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
