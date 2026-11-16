import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/proxy-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Panel de administración: sin idiomas, con sesión obligatoria y sin indexar ---
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const { response, user } = await updateSession(request);
    const isLogin = pathname === "/admin/login";

    if (!user && !isLogin) {
      const redirect = NextResponse.redirect(new URL("/admin/login", request.url));
      redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
      return redirect;
    }
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  // --- Sitio público: español sin prefijo (/carta), inglés con /en/carta ---
  const first = pathname.split("/")[1] ?? "";

  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  if ((locales as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

// Excluye API, _next y archivos estáticos. /admin SÍ pasa por aquí.
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
