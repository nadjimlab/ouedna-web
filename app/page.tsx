import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Compass, Heart, MapPinned, Sparkles, Star, Users, View } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import DesertScene from "@/components/platform/DesertScene";
import { siteConfig } from "@/app/metadata";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وادنا | اكتشف وادي سوف",
  description:
    "المنصة السياحية الرسمية لاكتشاف معالم واحات وتراث ولاية الوادي.",
  alternates: { canonical: siteConfig.url },
};

type Place = {
  id: number | string;
  name: string;
  description?: string | null;
  category?: string | null;
  main_category?: string | null;
  municipality?: string | null;
  image_url?: unknown;
  rating?: number | null;
  virtual_tour_url?: string | null;
};

const excluded = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

function firstImage(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return String(parsed[0] || "");
    } catch {}
    return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  }
  return "";
}

function categoryLabel(place: Place) {
  return place.category || place.main_category || "تراث وثقافة";
}

async function getPlaces(): Promise<Place[]> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from("places")
      .select("id,name,description,category,main_category,municipality,image_url,rating,virtual_tour_url")
      .eq("status", "منشور")
      .order("rating", { ascending: false })
      .limit(30);
    if (error) throw error;
    return (data || []).filter((p: Place) => !excluded.has(categoryLabel(p)));
  } catch {
    return [];
  }
}

const categories = [
  ["طبيعة وواحات", "واحات، كثبان ومساحات مفتوحة", "طبيعة"],
  ["تراث وعمارة", "القباب، القصور والذاكرة المحلية", "تراث"],
  ["تجارب وثقافة", "أسواق، مأكولات وقصص أهل الوادي", "ثقافة"],
] as const;

export default async function HomePage() {
  const places = await getPlaces();
  const featured = places.slice(0, 6);
  const tours = places.filter((p) => p.virtual_tour_url).slice(0, 3);

  return (
    <PlatformFrame active="/">
      <main className="eloued-home">
        <section className="eloued-hero">
          <DesertScene />
          <div className="eloued-hero__scrim" />
          <div className="eloued-hero__pattern" />
          <div className="platform-container eloued-hero__inner">
            <div className="eloued-hero__copy">
              <span className="eloued-eyebrow"><Sparkles size={15} /> المنصة السياحية لولاية الوادي</span>
              <h1>اكتشف الوادي<br /><em>بطريقة مختلفة.</em></h1>
              <p>من قلب الصحراء إلى واحات سوف وعمارتها الفريدة؛ ابدأ رحلتك من دليل حقيقي مرتبط بقاعدة بيانات وادنا.</p>
              <div className="eloued-actions">
                <Link href="/explore" className="eloued-btn eloued-btn--gold"><Compass size={18} /> ابدأ الاستكشاف <ArrowLeft size={16} /></Link>
                <Link href="/map" className="eloued-btn eloued-btn--outline"><MapPinned size={17} /> الخريطة التفاعلية</Link>
              </div>
              <div className="eloued-trust"><span>دليل سياحي متجدد</span><span>جولات 360°</span><span>عربي · Français · English</span></div>
            </div>
            <div className="eloued-hero__card">
              <img src="/ouedna/ouedna-hero-new.jpg" alt="واحة وادي سوف عند الغروب" />
              <div className="eloued-hero__card-caption"><small>WADI SOUF</small><strong>قلب الصحراء<br />ينبض هنا.</strong></div>
            </div>
          </div>
          <div className="eloued-hero__bottom"><span>01 / ابدأ الرحلة</span><span>مرر لاكتشاف المزيد ↓</span></div>
        </section>

        <section className="eloued-intro platform-container">
          <div className="eloued-number">02<small>لماذا وادنا</small></div>
          <div><span className="eloued-eyebrow eloued-eyebrow--dark">رحلة تبدأ من هنا</span><h2>اكتشف المكان<br /><em>بطريقتك.</em></h2></div>
          <p>واجهة حديثة فوق بيانات وادنا الحالية: المعالم المنشورة، الصور، التقييمات والمعلومات التي يديرها النظام الأصلي.</p>
        </section>

        <section className="eloued-section platform-container">
          <div className="eloued-heading"><div><span className="eloued-eyebrow eloued-eyebrow--dark">استكشف حسب الاهتمام</span><h2>اختر ما<br /><em>يشبهك.</em></h2></div><Link href="/explore" className="eloued-text-link">كل الأماكن <ArrowLeft size={15} /></Link></div>
          <div className="eloued-category-grid">
            {categories.map(([title, desc, query], i) => (
              <Link key={title} href={`/explore?category=${encodeURIComponent(query)}`} className={`eloued-category eloued-category--${i + 1}`}>
                <span>0{i + 1}</span><Compass size={24} /><h3>{title}</h3><p>{desc}</p><ArrowLeft size={17} />
              </Link>
            ))}
          </div>
        </section>

        <section className="eloued-featured">
          <div className="platform-container">
            <div className="eloued-heading"><div><span className="eloued-eyebrow eloued-eyebrow--dark">بيانات وادنا الحالية</span><h2>أماكن تستحق<br /><em>التوقف.</em></h2></div><Link href="/explore" className="eloued-text-link">افتح الدليل <ArrowLeft size={15} /></Link></div>
            {featured.length ? (
              <div className="eloued-place-grid">
                {featured.map((place, index) => {
                  const image = firstImage(place.image_url) || "/images/images.jpg";
                  return (
                    <article className={`eloued-place eloued-place--${index + 1}`} key={place.id}>
                      <Link href={`/place/${place.id}`} className="eloued-place__image"><img src={image} alt={place.name} loading={index > 1 ? "lazy" : "eager"} /><span>{index === 0 ? "اختيار وادنا" : categoryLabel(place)}</span></Link>
                      <div className="eloued-place__body"><div className="eloued-place__top"><h3>{place.name}</h3><Link href="/favorites" aria-label={`حفظ ${place.name}`}><Heart size={17} /></Link></div><p>{place.description || "معلم سياحي من بيانات وادنا المنشورة."}</p><div className="eloued-meta"><span><MapPinned size={14} /> {place.municipality || "ولاية الوادي"}</span><span><Star size={14} fill="currentColor" /> {Number(place.rating || 0).toFixed(1)}</span></div></div>
                    </article>
                  );
                })}
              </div>
            ) : <div className="eloued-empty">لا توجد أماكن منشورة حالياً في قاعدة البيانات.</div>}
          </div>
        </section>

        {tours.length ? (
          <section className="eloued-tours">
            <div className="platform-container"><div className="eloued-heading"><div><span className="eloued-eyebrow">تجربة مختلفة</span><h2>تجوّل قبل<br /><em>أن تصل.</em></h2></div><span className="eloued-tour-note"><View size={18} /> جولات افتراضية 360°</span></div>
              <div className="eloued-tour-grid">{tours.map((place) => <Link href={`/place/${place.id}`} className="eloued-tour" key={place.id}><img src={firstImage(place.image_url) || "/images/images.jpg"} alt={place.name} /><div><span>{categoryLabel(place)}</span><h3>{place.name}</h3><p>{place.municipality || "الوادي"}</p><strong>ابدأ الجولة <ArrowLeft size={14} /></strong></div></Link>)}</div>
            </div>
          </section>
        ) : null}

        <section className="eloued-journey"><div className="platform-container"><span className="eloued-eyebrow">03 / خطط الرحلة</span><h2>الطريق أجمل<br /><em>حين يكون لك.</em></h2><p>انتقل من الاكتشاف إلى التخطيط، واحفظ الأماكن التي تريد زيارتها.</p><div className="eloued-journey-links"><Link href="/itinerary"><CalendarDays size={20} /> خطط مسارك <ArrowLeft size={15} /></Link><Link href="/favorites"><Heart size={20} /> احفظ المفضلة <ArrowLeft size={15} /></Link><Link href="/community"><Users size={20} /> شارك قصتك <ArrowLeft size={15} /></Link></div></div></section>

        <section className="eloued-heritage platform-container"><div><span className="eloued-eyebrow eloued-eyebrow--dark">ذاكرة المكان</span><h2>ليس كل ما في الوادي<br /><em>يظهر في الخريطة.</em></h2><p>استكشف الأرشيف والتراث والقصص المرتبطة بالمكان.</p><Link href="/archive" className="eloued-btn eloued-btn--green"><Sparkles size={17} /> افتح الأرشيف</Link></div><div className="eloued-heritage-mark">وادنا<small>ذاكرة · مكان · رحلة</small></div></section>
      </main>
    </PlatformFrame>
  );
}
