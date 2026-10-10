import type { Metadata } from "next";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import { pageMetadata } from "@/app/metadata";

export const metadata: Metadata = pageMetadata({
  title: "خريطة الوادي السياحية | خريطة وادي سوف | وادنا",
  description: "استكشف معالم الوادي ووادي سوف على خريطة سياحية تفاعلية، وابحث عن الأماكن والمسارات المناسبة لرحلتك.",
  path: "/map",
});

export const revalidate = 3600;

async function getMapPlaces() {
  const supabase = createPublicClient(3600);
  const { data } = await supabase.from("places").select("id,name,municipality,main_category").eq("status", "منشور").order("id", { ascending: false }).limit(12);
  return data ?? [];
}

export default async function MapLayout({ children }: { children: React.ReactNode }) {
  const places = await getMapPlaces();
  return <>{children}<section className="platform-page platform-map-directory" aria-labelledby="map-directory-title"><div className="platform-container"><span className="platform-eyebrow"><i />دليل المعالم على الخريطة</span><h2 id="map-directory-title">أماكن سياحية في الوادي ووادي سوف</h2><p>تصفح المعالم المنشورة مباشرة من دليل وادنا، ثم افتح تفاصيل أي مكان لمعرفة موقعه وإضافته إلى خط رحلتك.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{places.map((place) => <Link key={place.id} href={`/place/${place.id}`} className="platform-place-card"><div className="platform-place-card__body"><strong>{place.name}</strong><small>{place.municipality || place.main_category || "ولاية الوادي"}</small><span>عرض تفاصيل المعلم</span></div></Link>)}</div></div></section></>;
}
