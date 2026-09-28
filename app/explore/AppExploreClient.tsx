"use client";

import { Compass, Heart, MapPin, Search, Star, ArrowLeft, MapPinned, Sparkles, View } from "lucide-react";
import Link from "next/link";
import DesertScene from "@/components/platform/DesertScene";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { useMemo, useState } from "react";

type Place = { id: string | number; name?: string; category?: string; description?: string; image_url?: unknown; municipality?: string; lat?: number; lng?: number; rating?: number; virtual_tour_url?: string | null };

function imageFor(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  return "";
}

export default function AppExploreClient({ places, dataError = "" }: { places: Place[]; dataError?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [tourOnly, setTourOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("souf360_favorites") || "[]").map(String);
    } catch {
      return [];
    }
  });

  const tourCount = useMemo(() => places.filter((place) => place.virtual_tour_url).length, [places]);
  const categories = useMemo(() => ["الكل", ...Array.from(new Set(places.map((place) => place.category).filter(Boolean) as string[]))], [places]);
  const filtered = useMemo(() => places.filter((place) => {
    const haystack = `${place.name || ""} ${place.description || ""} ${place.category || ""} ${place.municipality || ""}`.toLowerCase();
    return (!tourOnly || Boolean(place.virtual_tour_url)) && (category === "الكل" || place.category === category) && (!query.trim() || haystack.includes(query.toLowerCase().trim()));
  }), [places, query, category, tourOnly]);

  function toggleFavorite(id: string | number) {
    const current = new Set(favorites);
    const key = String(id);
    if (current.has(key)) current.delete(key);
    else current.add(key);
    const next = [...current];
    localStorage.setItem("souf360_favorites", JSON.stringify(next));
    setFavorites(next);
  }

  return (
    <section className="explore-sunset-page">
      <div className="desert-hero">
        <DesertScene />
        <div className="desert-hero__veil" />
        <div className="desert-hero__content platform-container">
          <span className="desert-hero__eyebrow"><i /> الدليل السياحي الرسمي · ولاية الوادي</span>
          <h1>اكتشف سحر<em>وادي سوف</em></h1>
          <p>أرض الألف قبة وواحات النخيل والكثبان الذهبية. معالم وتجارب أصيلة وجولات افتراضية 360° — دليلك الكامل لرحلة لا تُنسى في قلب الصحراء.</p>
          <div className="desert-hero__actions">
            <a className="desert-btn desert-btn--gold" href="#places"><Compass size={18} /> ابدأ الاستكشاف</a>
            <Link className="desert-btn desert-btn--glass" href="/map"><MapPinned size={18} /> افتح الخريطة</Link>
          </div>
          <div className="desert-hero__stats"><span><strong>{places.length || "—"}</strong><small>وجهة سياحية</small></span><span><strong>{categories.length > 1 ? categories.length - 1 : "—"}</strong><small>تصنيف</small></span><span><strong>{tourCount || "—"}</strong><small>جولة 360°</small></span></div>
        </div>
        <div className="desert-hero__scroll"><span /> مرر لاكتشاف المزيد</div>
        <svg className="desert-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0,70 C240,120 480,20 720,60 C960,100 1200,30 1440,70 L1440,120 L0,120 Z" fill="#faf4e9" /></svg>
      </div>

      <div id="places" className="explore-sunset-content platform-container">
        <div className="explore-sunset-heading"><div><span className="platform-eyebrow"><i />02 / دليل المعالم</span><h2>الأماكن التي<br /><em>تستحق الوصول.</em></h2><p>ابحث، صفِّ، واحفظ الأماكن التي تريد أن تراها في رحلتك.</p></div><div className="explore-sunset-heading__badge"><Compass size={27} /><span>بيانات حقيقية<br /><b>من وادنا</b></span></div></div>

        <div className="explore-sunset-toolbar"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن معلم، سوق، واحة..." /></label><div className="explore-sunset-categories">{tourCount > 0 ? <button type="button" className={`pano360-chip${tourOnly ? " is-active" : ""}`} aria-pressed={tourOnly} onClick={() => setTourOnly(!tourOnly)}><View size={14} /> جولات 360° ({tourCount})</button> : null}{categories.map((item) => <button key={item} type="button" className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        <div className="explore-sunset-results"><strong>{filtered.length} معلم متاح</strong><span>الأماكن المنشورة والمعتمدة في منصة وادنا</span></div>

        {dataError ? <div className="explore-sunset-error" role="alert"><Search size={26} /><div><h2>تعذر تحميل الأماكن</h2><p>{dataError}</p></div><button type="button" onClick={() => window.location.reload()}>إعادة المحاولة</button></div> : filtered.length ? <div className="explore-sunset-grid">{filtered.map((place, index) => {
          const image = imageFor(place.image_url) || "/ouedna/local-architecture.webp";
          const saved = favorites.includes(String(place.id));
          return <article className={`explore-sunset-card explore-sunset-card--${(index % 3) + 1}`} key={place.id}>
            <Link href={`/place/${place.id}`} className="explore-sunset-card__image"><LandmarkFrame src={image} alt={`${place.name || "معلم من وادي سوف"} — ${place.municipality || "ولاية الوادي"}`} category={place.category || "معلم سياحي"} tour={Boolean(place.virtual_tour_url)} index={index} /></Link>
            <button className={`explore-sunset-card__favorite${saved ? " is-active" : ""}`} type="button" aria-label={saved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} onClick={() => toggleFavorite(place.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
            <div className="explore-sunset-card__body"><Link href={`/place/${place.id}`}><h3>{place.name || "معلم من وادي سوف"}</h3></Link><p><MapPin size={14} />{place.municipality || "ولاية الوادي"}</p><div><span><Star size={13} fill="currentColor" /> {place.rating ? Number(place.rating).toFixed(1) : "جديد"}</span><Link href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name || "")}`}>إلى الخريطة <ArrowLeft size={13} /></Link></div></div>
          </article>;
        })}</div> : <div className="platform-empty-panel explore-sunset-empty"><Search size={28} /><h2>لا توجد نتائج مطابقة</h2><p>جرّب كلمة أخرى أو أعد اختيار كل التصنيفات.</p><button className="platform-button platform-button--green" type="button" onClick={() => { setQuery(""); setCategory("الكل"); setTourOnly(false); }}>إعادة التصفية</button></div>}

        <div className="explore-sunset-suggest"><div><Sparkles size={20} /><span><strong>تعرف معلماً غير موجود؟</strong><small>أضفه إلى الدليل وسيظهر بعد مراجعة الإدارة.</small></span></div><Link className="platform-button platform-button--amber" href="/suggest-place">اقتراح معلم</Link></div>
        <div className="explore-sunset-map-cta"><div><MapPinned size={22} /><span><strong>خطط طريقك من الخريطة</strong><small>شاهد المعالم حولك وانتقل إليها بسهولة.</small></span></div><Link href="/map">افتح الخريطة <ArrowLeft size={15} /></Link></div>
      </div>
    </section>
  );
}
