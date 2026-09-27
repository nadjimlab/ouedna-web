import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/app/metadata";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const revalidate = 3600;

const publicRoutes = [
  ["/explore", "daily", 1],
  ["/map", "weekly", 0.8],
  ["/archive", "weekly", 0.7],
  ["/community", "weekly", 0.6],
  ["/about", "monthly", 0.5],
  ["/download", "monthly", 0.5],
  ["/guide", "monthly", 0.5],
  ["/itinerary", "monthly", 0.5],
  ["/privacy", "yearly", 0.2],
  ["/suggest-place", "monthly", 0.4],
  ["/updates", "weekly", 0.4],
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = publicRoutes.map(([path, changeFrequency, priority]) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: places, error } = await supabase
      .from("places")
      .select("id,created_at")
      .eq("status", "منشور")
      .order("id", { ascending: false })
      .limit(5000);
    if (error || !places) return staticRoutes;
    return [
      ...staticRoutes,
      ...places.map((place) => ({
        url: `${siteConfig.url}/place/${place.id}`,
        lastModified: place.created_at ? new Date(place.created_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
