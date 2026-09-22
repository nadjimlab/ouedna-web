import { MetadataRoute } from "next";
import { siteConfig } from "./metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/favorites", "/maintenance", "/_next/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
