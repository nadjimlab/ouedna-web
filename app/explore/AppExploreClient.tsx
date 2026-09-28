"use client";

import { Compass, Heart, MapPin, Search, Star, ArrowLeft, MapPinned, Sparkles, View, Route, Archive, Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
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
    try { return JSON.parse(window.localStorage.getItem("souf360_favorites") || "[]").map(String); } catch { return []; }
  });
  const categories = useMemo(() => ["الكل", ...Array.from(new Set(places.map((place) => place.category).filter(Boolean) as string[]))], [places]);
  const tourPlaces = useMemo(() => places.filter((place) => place.virtual_tour_url), [places]);
  const filtered = useMemo(() => places.filter((place) => {
    const haystack = `${place.name || ""} ${place.description || ""} ${place.category || ""} ${place.municipality || ""}`.toLowerCase();
    return (!tourOnly || Boolean(place.virtual_tour_url)) && (category === "الكل" || place.category === category) && (!query.trim() || haystack.includes(query.toLowerCase().trim()));
  }), [places, query, category, tourOnly]);

  function toggleFavorite(id: string | number) {
    const current = new Set(favorites); const key = String(id);
    if (current.has(key)) current.delete(key); else current.add(key);
    const next = [...current]; localStorage.setItem("souf360_favorites", JSON.stringify(next)); setFavorites(next);
  }

  return <main className="app-explore-redesign">
    <section className="app-explore-welcome">
      <div className="app-explore-welcome__image" aria-hidden="true" />
      <div className="app-explore-welcome__veil" />
      <div className="platform-container app-explore-welcome__content">
        <span className="app-explore-welcome__brand"><span className="app-explore-welcome__mark">✦</span> وادنا · الدليل السياحي الرسمي</span>
        <span className="app-explore-welcome__badge">اكتشف الوادي</span>
        <h1>مرحباً بك في<br /><em>قلب الصحراء</em></h1>
        <p>من القباب التاريخية إلى الواحات الخضراء وسط الرمال الذهبية. خطط رحلتك واكتشف الأماكن التي تهمك.</p>
        <div className="app-explore-welcome__actions"><a href="#places" className="platform-button platform-button--amber"><Compass size={17} /> ابدأ الاستكشاف</a><Link href="/map" className="app-explore-glass"><MapPinned size={17} /> الخريطة التفاعلية</Link></div>
      </div>
    </section>

    <section className="app-explore-quick platform-container" aria-label="اختصارات وادنا">
      <Link href="/itinerary" className="app-explore-quick-card app-explore-quick-card--gold"><span><Route size={22} /></span><strong>خط رحلتي</strong><small>خطط يومك بسهولة</small><ArrowLeft size={16} /></Link>
      <Link href="/archive" className="app-explore-quick-card app-explore-quick-card--green"><span><Archive size={22} /></span><strong>أرشيف وذكريات</strong><small>اكتشف تاريخ وادي سوف</small><ArrowLeft size={16} /></Link>
      <Link href="/map" className="app-explore-quick-card app-explore-quick-card--blue"><span><MapPinned size={22} /></span><strong>الخريطة التفاعلية</strong><small>مسارات سياحية دقيقة</small><ArrowLeft size={16} /></Link>
      <Link href="/suggest-place" className="app-explore-quick-card app-explore-quick-card--sand"><span><Plus size={22} /></span><strong>اقترح معلماً</strong><small>أضف مكاناً للدليل</small><ArrowLeft size={16} /></Link>
    </section>

    {tourPlaces.length ? <section className="app-explore-tours platform-container"><div className="app-explore-section-head"><div><span className="platform-eyebrow"><i /> تجربة تفاعلية</span><h2>جولات 360°<br /><em>قبل الزيارة.</em></h2></div><button type="button" className="app-explore-view-all" onClick={() => { setTourOnly(true); document.getElementById("places")?.scrollIntoView({ behavior: "smooth" }); }}>عرض كل الجولات <ArrowLeft size={15} /></button></div><div className="app-explore-tour-strip">{tourPlaces.slice(0, 3).map((place, index) => <Link href={`/place/${place.id}`} className="app-explore-tour-item" key={place.id}><LandmarkFrame src={imageFor(place.image_url) || "/ouedna/local-architecture.webp"} alt={`${place.name || "معلم"} — ${place.municipality || "ولاية الوادي"}`} variant="thumb" tour index={index} /><span><b>{place.name}</b><small>{place.municipality || "ولاية الوادي"}</small></span><ArrowLeft size={17} /></Link>)}</div></section> : null}

    <section id="places" className="app-explore-directory platform-container">
      <div className="app-explore-section-head"><div><span className="platform-eyebrow"><i /> دليل وادنا</span><h2>اكتشف الأماكن<br /><em>التي تشبهك.</em></h2><p>ابحث عن معلمك القادم واحفظه ضمن رحلتك.</p></div><div className="app-explore-count"><strong>{filtered.length}</strong><small>معلم متاح</small></div></div>
      <div className="app-explore-controls"><label className="app-explore-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن معلم، واحة، سوق..." aria-label="البحث في المعالم" /></label><div className="app-explore-filter-label"><SlidersHorizontal size={16} /> تصفية حسب الاهتمام</div><div className="app-explore-categories"><button type="button" className={tourOnly ? "is-active" : ""} onClick={() => setTourOnly(!tourOnly)}><View size={14} /> 360° ({tourPlaces.length})</button>{categories.map((item) => <button type="button" key={item} className={category === item && !tourOnly ? "is-active" : ""} onClick={() => { setCategory(item); setTourOnly(false); }}>{item}</button>)}</div></div>
      {dataError ? <div className="app-explore-error" role="alert"><Search size={26} /><div><h2>تعذر تحميل الأماكن</h2><p>{dataError}</p></div><button type="button" onClick={() => window.location.reload()}>إعادة المحاولة</button></div> : filtered.length ? <div className="app-explore-grid">{filtered.map((place, index) => { const image = imageFor(place.image_url) || "/ouedna/local-architecture.webp"; const saved = favorites.includes(String(place.id)); return <article className="app-place-card" key={place.id}><Link href={`/place/${place.id}`} className="app-place-card__visual"><LandmarkFrame src={image} alt={`${place.name || "معلم من وادي سوف"} — ${place.municipality || "ولاية الوادي"}`} category={place.category || "معلم سياحي"} tour={Boolean(place.virtual_tour_url)} index={index} /></Link><button className={`app-place-card__favorite${saved ? " is-active" : ""}`} type="button" aria-label={saved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} onClick={() => toggleFavorite(place.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><div className="app-place-card__body"><Link href={`/place/${place.id}`}><h3>{place.name || "معلم من وادي سوف"}</h3></Link><p><MapPin size={14} /> {place.municipality || "ولاية الوادي"}</p><small>{place.description || "اكتشف تفاصيل هذا المعلم من دليل وادنا."}</small><div className="app-place-card__footer"><span><Star size={13} fill="currentColor" /> {place.rating ? Number(place.rating).toFixed(1) : "جديد"}</span><Link href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name || "")}`}>الخريطة <ArrowLeft size={13} /></Link></div></div></article>; })}</div> : <div className="platform-empty-panel app-explore-empty"><Search size={28} /><h2>لا توجد نتائج بهذا البحث</h2><p>جرّب تصنيفاً آخر أو اكتب كلمة بحث مختلفة.</p><button className="platform-button platform-button--green" type="button" onClick={() => { setQuery(""); setCategory("الكل"); setTourOnly(false); }}>إعادة التصفية</button></div>}
      <div className="app-explore-bottom-cta"><Sparkles size={20} /><span><strong>تعرف معلماً غير موجود؟</strong><small>ساعدنا في إثراء دليل وادنا المحلي.</small></span><Link href="/suggest-place" className="platform-button platform-button--amber">اقترح معلماً</Link></div>
    </section>
  </main>;
}
