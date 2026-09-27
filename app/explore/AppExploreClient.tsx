"use client";

import { Compass, Heart, MapPin, Search, Star, ArrowLeft, MapPinned, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Place = { id: string | number; name?: string; category?: string; description?: string; image_url?: unknown; municipality?: string; lat?: number; lng?: number; rating?: number };

function imageFor(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  return "";
}

export default function AppExploreClient({ places }: { places: Place[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("الكل");
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("souf360_favorites") || "[]").map(String);
    } catch {
      return [];
    }
  });

  const categories = useMemo(() => ["الكل", ...Array.from(new Set(places.map((place) => place.category).filter(Boolean) as string[]))], [places]);
  const filtered = useMemo(() => places.filter((place) => {
    const haystack = `${place.name || ""} ${place.description || ""} ${place.category || ""} ${place.municipality || ""}`.toLowerCase();
    return (category === "الكل" || place.category === category) && (!query.trim() || haystack.includes(query.toLowerCase().trim()));
  }), [places, query, category]);

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
      <div className="explore-sunset-hero">
        <div className="explore-sunset-hero__image" />
        <div className="explore-sunset-hero__veil" />
        <div className="explore-sunset-hero__sun" />
        <div className="explore-sunset-hero__content platform-container">
          <span className="explore-sunset-eyebrow"><i /> دليل وادي سوف · اكتشف على إيقاع الغروب</span>
          <h1>اكتشف<br /><em>الوجهة التي تشبهك.</em></h1>
          <p>معالم، واحات، قباب، وأسواق محلية — ابحث عن تجربتك القادمة في قلب الصحراء.</p>
          <div className="explore-sunset-hero__stats"><span><strong>{places.length || "—"}</strong><small>وجهة منشورة</small></span><span><strong>{categories.length > 1 ? categories.length - 1 : "—"}</strong><small>تصنيف سياحي</small></span><span><strong>24/7</strong><small>دليل متاح دائمًا</small></span></div>
        </div>
        <div className="explore-sunset-hero__scroll"><span /> مرر لاكتشاف المزيد</div>
      </div>

      <div className="explore-sunset-content platform-container">
        <div className="explore-sunset-heading"><div><span className="platform-eyebrow"><i />02 / دليل المعالم</span><h2>الأماكن التي<br /><em>تستحق الوصول.</em></h2><p>ابحث، صفِّ، واحفظ الأماكن التي تريد أن تراها في رحلتك.</p></div><div className="explore-sunset-heading__badge"><Compass size={27} /><span>بيانات حقيقية<br /><b>من وادنا</b></span></div></div>

        <div className="explore-sunset-toolbar"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن معلم، سوق، واحة..." /></label><div className="explore-sunset-categories">{categories.map((item) => <button key={item} type="button" className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        <div className="explore-sunset-results"><strong>{filtered.length} معلم متاح</strong><span>الأماكن المنشورة والمعتمدة في منصة وادنا</span></div>

        {filtered.length ? <div className="explore-sunset-grid">{filtered.map((place, index) => {
          const image = imageFor(place.image_url) || "/ouedna/local-architecture.webp";
          const saved = favorites.includes(String(place.id));
          return <article className={`explore-sunset-card explore-sunset-card--${(index % 3) + 1}`} key={place.id}>
            <Link href={`/place/${place.id}`} className="explore-sunset-card__image"><img src={image} alt={place.name || "معلم من وادي سوف"} onError={(event) => { event.currentTarget.src = "/ouedna/local-architecture.webp"; }} /><span>{place.category || "معلم سياحي"}</span><div className="explore-sunset-card__number">0{index + 1}</div></Link>
            <button className={`explore-sunset-card__favorite${saved ? " is-active" : ""}`} type="button" aria-label={saved ? "إزالة من المفضلة" : "إضافة إلى المفضلة"} onClick={() => toggleFavorite(place.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>
            <div className="explore-sunset-card__body"><Link href={`/place/${place.id}`}><h3>{place.name || "معلم من وادي سوف"}</h3></Link><p><MapPin size={14} />{place.municipality || "ولاية الوادي"}</p><div><span><Star size={13} fill="currentColor" /> {place.rating ? Number(place.rating).toFixed(1) : "جديد"}</span><Link href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name || "")}`}>إلى الخريطة <ArrowLeft size={13} /></Link></div></div>
          </article>;
        })}</div> : <div className="platform-empty-panel explore-sunset-empty"><Search size={28} /><h2>لا توجد نتائج مطابقة</h2><p>جرّب كلمة أخرى أو أعد اختيار كل التصنيفات.</p><button className="platform-button platform-button--green" type="button" onClick={() => { setQuery(""); setCategory("الكل"); }}>إعادة التصفية</button></div>}

        <div className="explore-sunset-suggest"><div><Sparkles size={20} /><span><strong>تعرف معلماً غير موجود؟</strong><small>أضفه إلى الدليل وسيظهر بعد مراجعة الإدارة.</small></span></div><Link className="platform-button platform-button--amber" href="/suggest-place">اقتراح معلم</Link></div>
        <div className="explore-sunset-map-cta"><div><MapPinned size={22} /><span><strong>خطط طريقك من الخريطة</strong><small>شاهد المعالم حولك وانتقل إليها بسهولة.</small></span></div><Link href="/map">افتح الخريطة <ArrowLeft size={15} /></Link></div>
      </div>
    </section>
  );
}
