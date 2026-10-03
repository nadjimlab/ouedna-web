import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import VirtualTour, { type Stop } from "@/components/vr/VirtualTour";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { pageMetadata } from "@/app/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "زيارة افتراضية VR لمعالم وادي سوف | وادنا",
  description: "تجوّل افتراضياً بين معالم ولاية الوادي بصور المعالم الحقيقية، وبوضع نظارة VR أو جولة 360° حيثما توفرت.",
  path: "/virtual-tour",
});

const excluded = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

function urls(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

async function loadStops(): Promise<Stop[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase
    .from("places")
    .select("id,name,description,main_category,municipality,address,image_url,virtual_tour_url")
    .eq("status", "منشور")
    .order("created_at", { ascending: false })
    .limit(60);
  const places = (data ?? []).filter((p) => !excluded.has(p.main_category || ""));
  const ids = places.map((p) => p.id);
  const { data: gallery } = ids.length
    ? await supabase.from("gallery").select("place_id,image_url,is_cover").in("place_id", ids).order("is_cover", { ascending: false }).limit(400)
    : { data: [] };
  const byPlace = new Map<number, string[]>();
  (gallery ?? []).forEach((g) => {
    if (!g.image_url) return;
    byPlace.set(g.place_id, [...(byPlace.get(g.place_id) ?? []), g.image_url]);
  });
  return places
    .map((p) => ({
      id: p.id as number,
      name: String(p.name),
      place: String(p.municipality || p.address || ""),
      category: String(p.main_category || ""),
      description: String(p.description || ""),
      photos: [...new Set([...urls(p.image_url), ...(byPlace.get(p.id) ?? [])])].slice(0, 8),
      pano: p.virtual_tour_url ? String(p.virtual_tour_url) : null,
    }))
    .filter((s) => s.photos.length > 0 || s.pano);
}

export default async function VirtualTourPage() {
  let stops: Stop[] = [];
  try {
    stops = await Promise.race([
      loadStops(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
  } catch {
    stops = [];
  }
  return (
    <PlatformFrame active="/virtual-tour" immersive>
      <VirtualTour stops={stops} />
    </PlatformFrame>
  );
}
