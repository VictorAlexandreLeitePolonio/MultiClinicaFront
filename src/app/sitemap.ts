import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// A LP é a única página pública indexável (perfis de clínica são modais, sem URL própria).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
