import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// Só a landing pública é indexável; áreas autenticadas/de auth ficam fora.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/app",
        "/superadmin",
        "/paciente",
        "/login",
        "/access-denied",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
