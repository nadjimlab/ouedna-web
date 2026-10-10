import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import AppExploreClient from "./AppExploreClient";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { siteConfig } from "@/app/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "اكتشف وادي سوف | وادنا Ouedna",
  description: "اكتشف معالم وادي سوف وواحاتها وأسواقها وتراثها عبر دليل وادنا السياحي التفاعلي.",
  alternates: { canonical: `${siteConfig.url}/explore` },
  openGraph: {
    title: "اكتشف وادي سوف | وادنا Ouedna",
    description: "معالم وواحات وتجارب محلية حقيقية في دليل سياحي واحد.",
    url: `${siteConfig.url}/explore`,
    images: [{ url: `${siteConfig.url}/ouedna/hero-oasis.jpg`, width: 2560, height: 1440, alt: "واحة وادي سوف عند الغروب" }],
  },
  twitter: { card: "summary_large_image", title: "اكتشف وادي سوف | وادنا Ouedna", description: "دليل وادنا التفاعلي لاكتشاف ولاية الوادي.", images: [`${siteConfig.url}/ouedna/hero-oasis.jpg`] },
};

const EMPTY_RESULT = { places: [], error: "تعذر تحميل الأماكن الآن. يمكنك إعادة المحاولة دون مغادرة الصفحة." };
const excludedPublicCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

export default async function ExplorePage() {
  const loadPlaces = async () => {
    const supabase = createPublicClient(300);
    const { data, error } = await supabase
      .from("places")
      // The public schema uses main_category; category is not a column in places.
      .select("id,name,description,main_category,municipality,address,image_url,rating,lat,lng,virtual_tour_url")
      .eq("status", "منشور")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    const visiblePlaces = (data ?? []).filter((place) => !excludedPublicCategories.has(place.main_category || ""));
    const ids = visiblePlaces.map((place) => place.id);
    const { data: gallery } = ids.length
      ? await supabase.from("gallery").select("place_id,image_url,is_cover").in("place_id", ids).order("is_cover", { ascending: false }).limit(240)
      : { data: [] };
    const galleryByPlace = new Map<number, string[]>();
    (gallery ?? []).forEach((image) => {
      const current = galleryByPlace.get(image.place_id) ?? [];
      if (image.image_url && !current.includes(image.image_url)) current.push(image.image_url);
      galleryByPlace.set(image.place_id, current);
    });
    return visiblePlaces.map((place) => ({ ...place, gallery: galleryByPlace.get(place.id) ?? [], category: place.main_category, municipality: place.municipality || place.address }));
  };

  let places = [];
  let error = "";
  try {
    places = await Promise.race([
      loadPlaces(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3500)),
    ]);
  } catch {
    ({ places, error } = EMPTY_RESULT);
  }

  return <PlatformFrame active="/explore"><AppExploreClient places={places} dataError={error} /></PlatformFrame>;
}
