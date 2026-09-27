import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import AppExploreClient from "./AppExploreClient";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
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
  twitter: { card: "summary_large_image", title: "اكتشف وادي سوف | وادنا Ouedna", description: "دليل وادنا التفاعلي لاكتشاف ولاية الوادي." },
};

const EMPTY_RESULT = { places: [], error: "تعذر تحميل الأماكن الآن. يمكنك إعادة المحاولة دون مغادرة الصفحة." };

export default async function ExplorePage() {
  const loadPlaces = async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("places")
      .select("id,name,description,category,main_category,municipality,address,image_url,rating,lat,lng")
      .eq("status", "منشور")
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw error;
    return (data ?? []).map((place) => ({ ...place, category: place.category || place.main_category, municipality: place.municipality || place.address }));
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
