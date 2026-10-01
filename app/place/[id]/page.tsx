import type { Metadata } from "next";
import { ArrowRight, Clock3, Globe2, MapPin, Phone, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlatformFrame from "@/components/platform/PlatformFrame";
import LazyPano360 from "@/components/platform/LazyPano360";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import PlaceDetailActions from "./PlaceDetailActions";
import { siteConfig } from "@/app/metadata";
import { View } from "lucide-react";
import TranslatedText from "@/components/platform/TranslatedText";

export const dynamic = "force-dynamic";

function images(value: unknown) { if (Array.isArray(value)) return value.map(String).filter(Boolean); if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).filter(Boolean); return []; }
const excludedPublicCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

async function getPlace(id: string) { const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); const { data } = await supabase.from("places").select("*").eq("id", Number(id)).eq("status", "منشور").maybeSingle(); if (!data || excludedPublicCategories.has(data.category || data.main_category || "")) return null; const { data: gallery } = await supabase.from("gallery").select("image_url,is_cover").eq("place_id", data.id).order("is_cover", { ascending: false }).limit(12); return { ...data, gallery: (gallery ?? []).map((image) => image.image_url).filter(Boolean) }; }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) return { title: "المعلم غير موجود | وادنا", robots: { index: false, follow: false } };
  const title = `${place.name} | وادنا Ouedna`;
  const description = place.description || `اكتشف تفاصيل ${place.name} وموقعه ضمن دليل وادنا السياحي في ولاية الوادي.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/place/${place.id}`, languages: { "ar-DZ": `${siteConfig.url}/place/${place.id}`, "fr-FR": `${siteConfig.url}/place/${place.id}`, "en-US": `${siteConfig.url}/place/${place.id}` } },
    openGraph: { type: "article", title, description, url: `${siteConfig.url}/place/${place.id}`, images: [{ url: `${siteConfig.url}/ouedna/local-architecture.webp`, alt: String(place.name) }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const place = await getPlace(id); if (!place) notFound(); const gallery = [...new Set([...images(place.image_url), ...images(place.gallery)])]; const hero = gallery[0] || "/ouedna/local-architecture.webp";
  const placeUrl = `${siteConfig.url}/place/${place.id}`;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "TouristAttraction", name: place.name, description: place.description || undefined, url: placeUrl, image: gallery.length ? gallery : [`${siteConfig.url}${hero}`], address: { "@type": "PostalAddress", addressLocality: place.municipality || place.address || "ولاية الوادي", addressCountry: "DZ" }, telephone: place.phone || undefined, geo: place.lat && place.lng ? { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng } : undefined }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "الرئيسية", item: siteConfig.url }, { "@type": "ListItem", position: 2, name: "استكشف", item: `${siteConfig.url}/explore` }, { "@type": "ListItem", position: 3, name: place.name, item: placeUrl }] }] };
  return <PlatformFrame active="/explore"><section className="place-detail-page"><div className="platform-container"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><nav className="place-detail-breadcrumbs" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span>/</span><Link href="/explore">استكشف</Link><span>/</span><span aria-current="page">{place.name}</span></nav><Link className="platform-back-link" href="/explore"><ArrowRight size={16} /> العودة إلى المعالم</Link><div className="place-detail-hero"><div className="place-detail-hero__image"><LandmarkFrame src={hero} alt={`${place.name} — ${place.municipality || place.address || "ولاية الوادي"}`} variant="feature" category={place.category || place.main_category || "معلم سياحي"} tour={Boolean(place.virtual_tour_url)} /></div><div className="place-detail-hero__copy"><span className="platform-eyebrow"><i />تفاصيل المعلم</span><h1><TranslatedText text={place.name} /></h1><p className="place-detail-location"><MapPin size={16} /> <TranslatedText text={place.municipality || place.address} fallback="ولاية الوادي" /></p><p className="place-detail-description"><TranslatedText text={place.description} fallback="المعلومة قيد التحديث من دليل Ouedna المحلي." /></p><div className="place-detail-rating">{place.rating ? <><Star size={17} fill="currentColor" /> {Number(place.rating).toFixed(1)} <span>تقييم موثّق</span></> : <span>لا توجد تقييمات بعد</span>}</div><PlaceDetailActions id={String(place.id)} name={place.name} /><Link className="platform-button platform-button--green place-start-route" href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name || "")}`}><MapPin size={17} /> افتح المعلم على الخريطة</Link></div></div>{gallery.length > 1 ? <div className="place-detail-gallery"><strong className="place-detail-gallery__title">معرض صور المعلم</strong>{gallery.slice(1, 5).map((image) => <img key={image} src={image} alt={`${place.name} — ${place.municipality || place.address || "ولاية الوادي"}`} loading="lazy" />)}</div> : null}{place.virtual_tour_url ? <div className="place-detail-tour"><div className="place-detail-tour__label"><View size={15} /> جولة افتراضية 360° داخل <TranslatedText text={place.name} /></div><LazyPano360 src={place.virtual_tour_url} title={place.name} /></div> : null}<div className="place-detail-info-grid"><article><MapPin size={20} /><div><strong>الموقع</strong><p>{place.address || place.municipality || "المعلومة غير متوفرة حالياً"}</p></div></article><article><Clock3 size={20} /><div><strong>ساعات الزيارة</strong><p>{place.opening_hours || "المعلومة غير متوفرة حالياً"}</p></div></article><article><Phone size={20} /><div><strong>التواصل</strong><p>{place.phone ? <a href={`tel:${place.phone}`}>{place.phone}</a> : "المعلومة غير متوفرة حالياً"}</p></div></article><article><Globe2 size={20} /><div><strong>البيانات</strong><p>معلومة منشورة من قاعدة Ouedna</p></div></article></div><div className="place-detail-note"><strong>تحتاج مساعدة؟</strong><p>شارك ملاحظة عن هذا المكان من صفحة المجتمع، أو اقترح تعديلاً لفريق الإدارة.</p><Link className="platform-text-link" href="/community">أرسل ملاحظة <ArrowRight size={14} /></Link></div></div></section></PlatformFrame>;
}
