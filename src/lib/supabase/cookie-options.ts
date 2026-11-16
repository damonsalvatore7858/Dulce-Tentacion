// Cookies de sesión del admin: HttpOnly (JavaScript no puede leerlas), Secure en producción, SameSite=Lax.
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
