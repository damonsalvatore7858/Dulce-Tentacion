import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

// Cliente con la sesión del usuario (clave anon + cookies). RLS decide qué puede hacer.
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase no está configurado");

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, ...AUTH_COOKIE_OPTIONS as Record<string, unknown> }),
          );
        } catch {
          // Desde un Server Component no se pueden escribir cookies: el proxy refresca la sesión.
        }
      },
    },
  });
}
