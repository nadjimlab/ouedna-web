import type { Metadata } from "next";
import { ArrowRight, Clock3, Globe2, Heart, MapPin, Navigation, Phone, Share2, Star, View } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlatformFrame from "@/components/platform/PlatformFrame";
import LazyPano360 from "@/components/platform/LazyPano360";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import PlaceDetailActions from "./PlaceDetailActions";
import { siteConfig } from "@/app/metadata";

export const dynamic = "force-dynamic";

const excludedPublicCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

function images(value: unknown) {
  const values = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim())
      : [];
  return Array.from(new Set(values.filter(Boolean)));
}

async function getPlace(id: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase
    .from("places")
    .select("*")
    .eq("id", Number(id))
    .eq("status", "منشور")
    .maybeSingle();
  return data && !excludedPublicCategories.has(data.category || data.main_category || "") ? data : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) return { title: "المعلم غير موجود | وادنا", robots: { index: false, follow: false } };
  const title = `${place.name} | وادنا Ouedna`;
  const description = place.description || `اكتشف تفاصيل ${place.name} وموقعه ضمن دليل وادنا السياحي في ولاية الوادي.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/place/${place.id}` },
    openGraph: { type: "article", title, description, url: `${siteConfig.url}/place/${place.id}`, images: [{ url: images(place.image_url)[0] || `${siteConfig.url}/ouedna/local-architecture.webp`, alt: String(place.name) }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await getPlace(id);
  if (!place) notFound();

  const gallery = images(place.image_url);
  const hero = gallery[0] || "/ouedna/local-architecture.webp";
  const location = place.municipality || place.address || "ولاية الوادي";
  const mapUrl = `/map?placeId=${place.id}&destination=${encodeURIComponent(place.name || "")}`;
  const category = place.category || place.main_category || "معلم سياحي";
  const schema = { "@context": "https://schema.org", "@type": "TouristAttraction", name: place.name, description: place.description || undefined, url: `${siteConfig.url}/place/${place.id}`, image: gallery.length ? gallery : [`${siteConfig.url}${hero}`], address: { "@type": "PostalAddress", addressLocality: location, addressCountry: "DZ" }, telephone: place.phone || undefined, geo: place.lat && place.lng ? { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng } : undefined };

  return (
    <PlatformFrame active="/explore">
      <main className="place-detail-page" dir="rtl">
        <div className="platform-container place-detail-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          <Link className="place-detail-back" href="/explore"><ArrowRight size={16} /> العودة إلى دليل المعالم</Link>

          <section className="place-detail-hero" aria-labelledby="place-title">
            <div className="place-detail-media">
              <div className="place-detail-main-image">
                <LandmarkFrame src={hero} alt={`${place.name} — ${location}`} variant="feature" category={category} tour={Boolean(place.virtual_tour_url)} />
                <span className="place-detail-image-count"><View size={14} /> {gallery.length ? `${gallery.length} ${gallery.length === 1 ? "صورة منشورة" : "صور منشورة"}` : "صورة المعلم"}</span>
              </div>
              <div className="place-detail-thumbs" aria-label="معرض صور المعلم">
                {gallery.length ? gallery.slice(0, 5).map((image, index) => <a className={`place-detail-thumb${index === 0 ? " is-active" : ""}`} href={image} target="_blank" rel="noreferrer" key={image}><img src={image} alt={`${place.name} — صورة ${index + 1}`} loading={index ? "lazy" : "eager"} /></a>) : <div className="place-detail-no-images">لا توجد صور إضافية منشورة لهذا المعلم بعد.</div>}
              </div>
            </div>

            <div className="place-detail-copy">
              <span className="place-detail-kicker"><i /> {category}</span>
              <h1 id="place-title">{place.name}</h1>
              <p className="place-detail-location"><MapPin size={17} /> {location}</p>
              <div className="place-detail-rating"><Star size={17} fill="currentColor" /> <strong>{place.rating ? Number(place.rating).toFixed(1) : "جديد"}</strong><span>تقييم الدليل</span></div>
              <p className="place-detail-description">{place.description || "اكتشف تفاصيل هذا المعلم من دليل وادنا المحلي."}</p>
              <div className="place-detail-primary-actions"><Link className="place-detail-map-button" href={mapUrl}><Navigation size={18} /> عرض على الخريطة</Link><Link className="place-detail-route-button" href={mapUrl}>ابدأ الرحلة <ArrowRight size={16} /></Link></div>
              <PlaceDetailActions id={String(place.id)} name={place.name} />
            </div>
          </section>

          {place.virtual_tour_url ? <section className="place-detail-tour"><div className="place-detail-tour__label"><View size={15} /> جولة افتراضية 360° داخل {place.name}</div><LazyPano360 src={place.virtual_tour_url} title={place.name} /></section> : null}

          <section className="place-detail-info-grid" aria-label="معلومات المعلم">
            <article><MapPin size={20} /><div><strong>الموقع</strong><p>{place.address || location}</p></div></article>
            <article><Clock3 size={20} /><div><strong>ساعات الزيارة</strong><p>{place.opening_hours || "تحقق من المعلومات قبل الزيارة"}</p></div></article>
            <article><Phone size={20} /><div><strong>التواصل</strong><p>{place.phone ? <a href={`tel:${place.phone}`}>{place.phone}</a> : "غير متوفر حالياً"}</p></div></article>
            <article><Globe2 size={20} /><div><strong>البيانات</strong><p>معلومة منشورة من قاعدة وادنا</p></div></article>
          </section>

          <section className="place-detail-note"><div><strong>خطط زيارتك بذكاء</strong><p>احفظ المكان أو افتح الخريطة للوصول إليه ضمن مسارك السياحي.</p></div><Link href={mapUrl}><MapPin size={16} /> افتح المسار</Link></section>
        </div>
      </main>
    </PlatformFrame>
  );
}
