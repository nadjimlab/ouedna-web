import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { siteConfig } from "@/app/metadata";

export const revalidate = 3600;

const publicRoutes = [
  ["/", "daily", 1],
  ["/explore", "daily", 1],
  ["/map", "weekly", 0.8],
  ["/virtual-tour", "weekly", 0.8],
  ["/archive", "weekly", 0.7],
  ["/community", "weekly", 0.6],
  ["/about", "monthly", 0.5],
  ["/download", "monthly", 0.5],
  ["/guide", "monthly", 0.5],
  ["/agencies", "weekly", 0.6],
  ["/advertise", "monthly", 0.4],
  ["/privacy", "yearly", 0.2],
] as const;
const excludedPublicCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = publicRoutes.map(([path, changeFrequency, priority]) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency,
    priority,
  }));

  try {
    const supabase = createPublicClient(3600);
    const { data: places, error } = await supabase
      .from("places")
      .select("id,created_at,main_category")
      .eq("status", "منشور")
      .order("id", { ascending: false })
      .limit(5000);
    if (error || !places) return staticRoutes;
    return [
      ...staticRoutes,
      ...places.filter((place) => !excludedPublicCategories.has(place.main_category || "")).map((place) => ({
        url: `${siteConfig.url}/place/${place.id}`,
        ...(place.created_at ? { lastModified: new Date(place.created_at) } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
