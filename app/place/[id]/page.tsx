import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, Clock3, Globe2, MapPin, Phone, Star, View } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlatformFrame from "@/components/platform/PlatformFrame";
import LazyPano360 from "@/components/platform/LazyPano360";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import PlaceDetailActions from "./PlaceDetailActions";
import { siteConfig } from "@/app/metadata";
import TranslatedText from "@/components/platform/TranslatedText";

export const dynamic = "force-dynamic";

const excludedPublicCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);
type RelatedPlace = { id: number; name: string; main_category?: string | null; municipality?: string | null; image_url?: unknown };

function images(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

async function getPlace(id: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase
    .from("places")
    .select("*")
    .eq("id", Number(id))
    .eq("status", "منشور")
    .maybeSingle();
  if (!data || excludedPublicCategories.has(data.category || data.main_category || "")) return null;

  const [{ data: gallery }, { data: candidates }] = await Promise.all([
    supabase.from("gallery").select("image_url,is_cover").eq("place_id", data.id).order("is_cover", { ascending: false }).limit(12),
    supabase.from("places").select("id,name,main_category,municipality,image_url").eq("status", "منشور").neq("id", data.id).order("id", { ascending: false }).limit(80),
  ]);

  const related: RelatedPlace[] = ((candidates ?? []) as RelatedPlace[])
    .filter((candidate) => !excludedPublicCategories.has(candidate.main_category || ""))
    .filter((candidate) => candidate.main_category === data.main_category || candidate.municipality === data.municipality)
    .slice(0, 4);

  return {
    ...data,
    gallery: (gallery ?? []).map((image) => image.image_url).filter(Boolean),
    related,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();
  const title = `${place.name} | وادنا Ouedna — وادي سوف`;
  const description = place.description || `اكتشف تفاصيل ${place.name} وموقعه ضمن دليل وادنا السياحي في ولاية الوادي.`;
  const image = images(place.image_url)[0] || place.gallery[0] || `${siteConfig.url}/ouedna/local-architecture.webp`;
  const imageUrl = image.startsWith("http") ? image : `${siteConfig.url}${image.startsWith("/") ? image : `/${image}`}`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/place/${place.id}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${siteConfig.url}/place/${place.id}`,
      siteName: siteConfig.siteName,
      images: [{ url: imageUrl, alt: String(place.name) }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();

  const gallery = [...new Set([...images(place.image_url), ...images(place.gallery)])];
  const hero = gallery[0] || "/ouedna/local-architecture.webp";
  const placeBackground = hero.replace(/"/g, '\\"');
  const relatedPlaces = (Array.isArray(place.related) ? place.related : []) as RelatedPlace[];
  const placeUrl = `${siteConfig.url}/place/${place.id}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        name: place.name,
        description: place.description || undefined,
        url: placeUrl,
        image: gallery.length ? gallery : [`${siteConfig.url}${hero}`],
        address: { "@type": "PostalAddress", addressLocality: place.municipality || place.address || "ولاية الوادي", addressCountry: "DZ" },
        telephone: place.phone || undefined,
        geo: place.lat && place.lng ? { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng } : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "استكشف معالم وادي سوف", item: `${siteConfig.url}/explore` },
          { "@type": "ListItem", position: 3, name: place.name, item: placeUrl },
        ],
      },
    ],
  };

  return (
    <PlatformFrame active="/explore">
      <section className="place-detail-page place-detail-page--immersive" style={{ "--place-image": `url("${placeBackground}")` } as CSSProperties}>
        <div className="platform-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          <nav className="place-detail-breadcrumbs" aria-label="مسار التنقل">
            <Link href="/">الرئيسية</Link><span>/</span><Link href="/explore">استكشف معالم وادي سوف</Link><span>/</span><span aria-current="page">{place.name}</span>
          </nav>
          <Link className="platform-back-link" href="/explore"><ArrowRight size={16} /> العودة إلى دليل المعالم</Link>

          <div className="place-detail-hero">
            <div className="place-detail-hero__image"><LandmarkFrame src={hero} alt={`${place.name} — ${place.municipality || place.address || "ولاية الوادي"}`} variant="feature" category={place.category || place.main_category || "معلم سياحي"} tour={Boolean(place.virtual_tour_url)} /></div>
            <div className="place-detail-hero__copy">
              <span className="platform-eyebrow"><i />تفاصيل معلم في وادي سوف</span>
              <h1><TranslatedText text={place.name} /></h1>
              <p className="place-detail-location"><MapPin size={16} /> <TranslatedText text={place.municipality || place.address} fallback="ولاية الوادي" /></p>
              <p className="place-detail-description"><TranslatedText text={place.description} fallback="المعلومة قيد التحديث من دليل Ouedna المحلي." /></p>
              <div className="place-detail-rating">{place.rating ? <><Star size={17} fill="currentColor" /> {Number(place.rating).toFixed(1)} <span>التقييم المتاح</span></> : <span>لا توجد تقييمات بعد</span>}</div>
              <PlaceDetailActions id={String(place.id)} name={place.name} />
              <div className="flex flex-wrap gap-2">
                <Link className="platform-button platform-button--green place-start-route" href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name || "")}`}><MapPin size={17} /> شاهد الموقع على خريطة الوادي</Link>
                <Link className="platform-button platform-button--outline" href={`/itinerary?placeId=${place.id}`}>أضف المكان إلى خط رحلتك</Link>
              </div>
            </div>
          </div>

          {gallery.length > 1 ? <div className="place-detail-gallery"><strong className="place-detail-gallery__title">صور {place.name} في وادي سوف</strong>{gallery.slice(1, 5).map((image) => <Image key={image} src={image} alt={`${place.name} — ${place.municipality || place.address || "ولاية الوادي"}`} width={640} height={420} sizes="(max-width: 700px) 100vw, 25vw" loading="lazy" unoptimized />)}</div> : null}
          {place.virtual_tour_url ? <div className="place-detail-tour"><div className="place-detail-tour__label"><View size={15} /> جولة افتراضية 360° داخل <TranslatedText text={place.name} /></div><LazyPano360 src={place.virtual_tour_url} title={place.name} /></div> : null}

          <div className="place-detail-info-grid">
            <article><MapPin size={20} /><div><strong>الموقع</strong><p>{place.address || place.municipality || "المعلومة غير متوفرة حالياً"}</p></div></article>
            <article><Clock3 size={20} /><div><strong>ساعات الزيارة</strong><p>{place.opening_hours || "المعلومة غير متوفرة حالياً"}</p></div></article>
            <article><Phone size={20} /><div><strong>التواصل</strong><p>{place.phone ? <a href={`tel:${place.phone}`}>{place.phone}</a> : "المعلومة غير متوفرة حالياً"}</p></div></article>
            <article><Globe2 size={20} /><div><strong>البيانات</strong><p>معلومة منشورة من قاعدة Ouedna</p></div></article>
          </div>

          {relatedPlaces.length ? <section className="mt-12" aria-labelledby="related-places-title"><div className="platform-section-heading"><span className="platform-eyebrow"><i />اكتشاف قريب</span><h2 id="related-places-title">أماكن مرتبطة في وادي سوف</h2><p>استكشف معالم أخرى منشورة تشترك في الموقع أو التصنيف مع هذا المكان.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{relatedPlaces.map((related) => <Link href={`/place/${related.id}`} key={related.id} className="platform-place-card"><div className="platform-place-card__body"><strong>{related.name}</strong><small>{related.municipality || related.main_category || "ولاية الوادي"}</small><span>عرض تفاصيل المعلم <ArrowRight size={14} /></span></div></Link>)}</div></section> : null}

          <div className="place-detail-note"><strong>تحتاج مساعدة؟</strong><p>شارك ملاحظة عن هذا المكان من صفحة المجتمع، أو اقترح تعديلاً لفريق الإدارة.</p><Link className="platform-text-link" href="/community">شارك تجربة حقيقية عن وادي سوف <ArrowRight size={14} /></Link></div>
        </div>
      </section>
    </PlatformFrame>
  );
}
