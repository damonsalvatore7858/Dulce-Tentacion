import "server-only";

// "Producción real": Vercel production, o `next start` fuera de Vercel.
// En local y en previews de Vercel (VERCEL_ENV=preview) se permiten atajos de desarrollo.
export const isProductionDeploy =
  process.env.VERCEL_ENV === "production" ||
  (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);
