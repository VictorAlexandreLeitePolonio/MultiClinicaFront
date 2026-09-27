import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// A landing e as páginas legais são públicas; áreas de acesso ficam fora.
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
        "/convite",
        "/backend",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
