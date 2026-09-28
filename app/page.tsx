import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Compass, Heart, MapPinned, Sparkles, Star, Users, View } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import DesertScene from "@/components/platform/DesertScene";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { siteConfig } from "@/app/metadata";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وادنا | اكتشف وادي سوف",
  description: "المنصة السياحية الرسمية لاكتشاف معالم وواحات وتراث ولاية الوادي.",
  alternates: { canonical: siteConfig.url },
};

type FeaturedPlace = { id: string | number; name: string; category: string; municipality: string; description: string; image: string; rating: number; virtualTour?: string | null };

const excludedCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);

function firstImage(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  return "";
}

async function getFeaturedPlaces(): Promise<FeaturedPlace[]> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await supabase.from("places").select("id,name,description,main_category,municipality,address,image_url,rating,virtual_tour_url").eq("status", "منشور").order("rating", { ascending: false }).limit(60);
    return (data || []).filter((place) => !excludedCategories.has(place.main_category || "")).slice(0, 6).map((place) => ({
      id: place.id,
      name: place.name || "معلم من وادي سوف",
      category: place.main_category || "معلم سياحي",
      municipality: place.municipality || place.address || "ولاية الوادي",
      description: place.description || "معلَم أصيل من معالم وادي سوف.",
      image: firstImage(place.image_url) || "/ouedna/local-architecture.webp",
      rating: Number(place.rating || 0),
      virtualTour: place.virtual_tour_url,
    }));
  } catch {
    return [];
  }
}

const categories = [
  ["طبيعة وواحات", "واحات، كثبان، ومساحات مفتوحة", "#e7f0e5"],
  ["تراث وعمارة", "القباب، القصور، والذاكرة المحلية", "#f5e6c9"],
  ["تجارب وثقافة", "أسواق، مأكولات، وقصص أهل الوادي", "#e6eef0"],
] as const;

export default async function HomePage() {
  const places = await getFeaturedPlaces();
  const tourPlaces = places.filter((place) => place.virtualTour);
  return (
    <PlatformFrame active="/">
      <main className="home-relaunch">
        <section className="home-relaunch__hero home-relaunch__hero--immersive">
          <DesertScene />
          <div className="home-relaunch__hero-bg" />
          <div className="home-relaunch__hero-inner platform-container">
            <div className="home-relaunch__hero-copy">
              <span className="platform-eyebrow"><i /> المنصة السياحية الرسمية لولاية الوادي</span>
              <h1>اكتشف ولاية<br /><em>الألف قبة وقبة.</em></h1>
              <p>هنا تبدأ الحكاية؛ واحة تحت غروب ذهبي، رمال تنبض بالحياة، ومعالم أصيلة تنتظر أن تكتشفها بطريقتك.</p>
              <div className="home-relaunch__actions"><Link className="platform-button platform-button--amber" href="/explore"><Compass size={18} /> ابدأ الاستكشاف <ArrowLeft size={16} /></Link><Link className="platform-button platform-button--outline" href="/map"><MapPinned size={17} /> الخريطة التفاعلية</Link></div>
              <div className="home-relaunch__trust"><span><i /> دليل محلي موثوق</span><span>تجارب 360°</span><span>عربي · Français · English</span></div>
            </div>
            <div className="home-relaunch__hero-card" aria-label="معاينة واحة وادي سوف">
              <Image src="/ouedna/ouedna-hero-new.jpg" alt="واحة وادي سوف عند الغروب" fill priority sizes="(max-width: 900px) 100vw, 45vw" />
              <div><span>WADI SOUF</span><strong>قلب الصحراء<br />ينبض هنا.</strong></div>
            </div>
          </div>
          <div className="home-relaunch__hero-bottom"><span>01 / ابدأ الرحلة</span><span>مرر لاكتشاف المزيد ↓</span></div>
        </section>

        <section className="home-relaunch__intro platform-container"><div className="home-relaunch__section-number">02<br /><small>لماذا وادنا</small></div><div><span className="platform-eyebrow"><i /> رحلة تبدأ من هنا</span><h2>اكتشف المكان<br /><em>بطريقتك.</em></h2></div><p>وادنا يجمع الدليل والمجتمع والخريطة في تجربة واحدة؛ لتنتقل من فكرة الزيارة إلى طريق واضح، دون أن تفقد روح المكان.</p></section>

        <section className="home-relaunch__categories platform-container"><div className="home-relaunch__heading"><div><span className="platform-eyebrow"><i /> استكشف حسب الاهتمام</span><h2>اختر ما<br /><em>يشبهك.</em></h2></div><Link className="platform-text-link" href="/explore">كل الأماكن <ArrowLeft size={15} /></Link></div><div className="home-relaunch__category-grid">{categories.map(([title, description, color], index) => <Link href={`/explore?category=${encodeURIComponent(title)}`} className="home-relaunch__category" style={{ background: color }} key={title}><span>0{index + 1}</span><Compass size={24} /><h3>{title}</h3><p>{description}</p><ArrowLeft size={17} /></Link>)}</div></section>

        <section className="home-relaunch__featured"><div className="platform-container"><div className="home-relaunch__heading"><div><span className="platform-eyebrow"><i /> اختيارات وادنا</span><h2>أماكن تستحق<br /><em>التوقف.</em></h2></div><Link className="platform-text-link" href="/explore">اكتشف الدليل <ArrowLeft size={15} /></Link></div>{places.length ? <div className="home-relaunch__places">{places.map((place, index) => <article className={`home-relaunch__place home-relaunch__place--${index + 1}`} key={place.id}><Link href={`/place/${place.id}`} className="home-relaunch__place-frame"><LandmarkFrame src={place.image} alt={`${place.name} — ${place.municipality}`} variant={index === 0 ? "feature" : "card"} category={place.category} tour={Boolean(place.virtualTour)} index={index} /></Link><div><h3>{place.name}</h3><p><MapPinned size={12} /> {place.municipality} · <Star size={12} fill="currentColor" /> {place.rating ? place.rating.toFixed(1) : "جديد"}</p><small>{place.description}</small><Link className="home-relaunch__place-map" href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name)}`}><MapPinned size={14} /> عرض على الخريطة <ArrowLeft size={13} /></Link></div></article>)}</div> : <div className="ds-empty">اكتشف أولى المعالم من صفحة الاستكشاف.</div>}</div></section>

        {tourPlaces.length ? <section className="home-relaunch__tours"><div className="platform-container"><div className="home-relaunch__heading"><div><span className="platform-eyebrow"><i /> تجربة مختلفة</span><h2>تجوّل قبل<br /><em>أن تصل.</em></h2></div><span className="home-relaunch__tour-note"><View size={18} /> جولات افتراضية 360°</span></div><div className="home-relaunch__tour-grid">{tourPlaces.map((place) => <article className="home-relaunch__tour-card" key={place.id}><LandmarkFrame src={place.image} alt={`${place.name} — ${place.municipality}`} variant="thumb" tour /><div><span>{place.category}</span><h3>{place.name}</h3><p>{place.municipality}</p><Link href={`/place/${place.id}`} className="platform-button platform-button--amber"><View size={15} /> ابدأ الجولة <ArrowLeft size={14} /></Link></div></article>)}</div></div></section> : null}

        <section className="home-relaunch__journey"><div className="platform-container"><span className="platform-eyebrow">03 / خطط الرحلة</span><h2>الطريق أجمل<br /><em>حين يكون لك.</em></h2><p>ابنِ يوماً حول الأماكن التي تحبها، شاهد الخريطة، واحفظ المعالم التي تريد العودة إليها.</p><div className="home-relaunch__journey-links"><Link href="/itinerary"><CalendarDays size={20} /> خطط مسارك <ArrowLeft size={15} /></Link><Link href="/favorites"><Heart size={20} /> احفظ المفضلة <ArrowLeft size={15} /></Link><Link href="/community"><Users size={20} /> شارك قصتك <ArrowLeft size={15} /></Link></div></div></section>

        <section className="home-relaunch__heritage platform-container"><div><span className="platform-eyebrow"><i /> ذاكرة المكان</span><h2>ليس كل ما في الوادي<br /><em>يظهر في الخريطة.</em></h2><p>من القباب القديمة إلى القصص التي تحفظها العائلات، افتح أرشيف وادنا واكتشف طبقات أخرى من المكان.</p><Link className="platform-button platform-button--green" href="/archive"><Sparkles size={17} /> افتح الأرشيف</Link></div><div className="home-relaunch__heritage-mark">وادنا<small>ذاكرة · مكان · رحلة</small></div></section>
      </main>
    </PlatformFrame>
  );
}
