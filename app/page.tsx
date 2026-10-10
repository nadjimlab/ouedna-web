import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Route, Sparkles } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import PlatformFrame from "@/components/platform/PlatformFrame";
import HomeHero from "@/components/home/HomeHero";
import { siteConfig } from "@/app/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وادنا | اكتشف وادي سوف",
  description: "دليل سياحي محلي لاكتشاف معالم واحات وتراث ولاية الوادي.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    title: "وادنا | اكتشف وادي سوف",
    description: "معالم حقيقية، خرائط، تراث ومسارات لتعيش وادي سوف على إيقاعك.",
    url: siteConfig.url,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}`, alt: "واحة وادي سوف عند الغروب" }],
  },
  twitter: { card: "summary_large_image", title: "وادنا | اكتشف وادي سوف", description: "دليلك الرقمي لاكتشاف ولاية الوادي.", images: [`${siteConfig.url}${siteConfig.ogImage}`] },
};

type FeaturedPlace = { id: number; name: string; description: string | null; category: string | null; municipality: string | null; image_url: unknown };

function firstImage(value: unknown) {
  if (Array.isArray(value)) return value.map(String).find(Boolean) ?? "/ouedna/local-architecture.webp";
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).find(Boolean) ?? "/ouedna/local-architecture.webp";
  return "/ouedna/local-architecture.webp";
}

async function getFeaturedPlaces(): Promise<FeaturedPlace[]> {
  try {
    const supabase = createPublicClient(300);
    const { data } = await supabase
      .from("places")
      .select("id,name,description,main_category,municipality,address,image_url")
      .eq("status", "منشور")
      .order("created_at", { ascending: false })
      .limit(6);
    return (data ?? []).map((place) => ({
      id: place.id,
      name: place.name,
      description: place.description,
      category: place.main_category,
      municipality: place.municipality || place.address,
      image_url: place.image_url,
    }));
  } catch {
    return [];
  }
}

async function HomeDirectory() {
  const places = await getFeaturedPlaces();
  return (
    <section className="home-directory" aria-labelledby="home-directory-title">
      <div className="platform-container">
        <div className="home-directory__heading">
          <div>
            <span className="platform-eyebrow"><i /> دليل محلي يتجدد</span>
            <h2 id="home-directory-title">ابدأ من المكان الذي يشبهك</h2>
            <p>معالم منشورة من قاعدة وادنا، مع معلومات واضحة تساعدك على اختيار محطتك التالية.</p>
          </div>
          <Link className="platform-text-link" href="/explore">عرض كل المعالم <ArrowLeft size={16} /></Link>
        </div>
        {places.length ? (
          <div className="home-directory__grid">
            {places.map((place) => (
              <article className="home-directory__card" key={place.id}>
                <Link href={`/place/${place.id}`} className="home-directory__image">
                  <Image src={firstImage(place.image_url)} alt={place.name} fill sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 30vw" />
                </Link>
                <div className="home-directory__body">
                  <span>{place.category || "معلم سياحي"}</span>
                  <h3><Link href={`/place/${place.id}`}>{place.name}</Link></h3>
                  <p>{place.description || "المعلومة قيد التحديث من فريق وادنا."}</p>
                  <div className="home-directory__meta"><small><MapPin size={14} /> {place.municipality || "ولاية الوادي"}</small><Link href={`/place/${place.id}`} aria-label={`تفاصيل ${place.name}`}><ArrowLeft size={16} /></Link></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="platform-empty-panel home-directory__empty"><Sparkles size={26} /><h3>الدليل يتوسع الآن</h3><p>لا توجد معالم منشورة للعرض حالياً. يمكنك العودة إلى الاستكشاف لاحقاً.</p><Link className="platform-button platform-button--green" href="/explore">استكشف الدليل</Link></div>
        )}
        <div className="home-directory__actions">
          <Link className="platform-button platform-button--green" href="/itinerary"><Route size={17} /> خطط رحلتك</Link>
          <Link className="platform-button platform-button--ghost" href="/map">افتح الخريطة التفاعلية</Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <PlatformFrame active="/" immersive>
      <HomeHero />
      <HomeDirectory />
    </PlatformFrame>
  );
}
