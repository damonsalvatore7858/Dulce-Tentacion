import type { MetadataRoute } from "next";
import { isProductionDeploy } from "@/lib/security/env";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Previews y desarrollo NO se indexan: solo la producción real.
  if (!isProductionDeploy) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${SITE_URL.replace(/\/+$/, "")}/sitemap.xml`,
  };
}
