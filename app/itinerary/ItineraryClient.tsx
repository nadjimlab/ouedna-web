"use client";

import { CalendarDays, Check, Compass, LocateFixed, MapPin, Navigation, RefreshCw, Share2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Place = { id: number; name: string; description?: string; main_category?: string; category?: string; municipality?: string; image_url?: unknown; lat?: number; lng?: number };
const excludedPublicCategories = new Set(["مرافق صحية", "صحي", "طبي", "مستشفيات"]);
const ITINERARY_KEY = "ouedna.itinerary.ids";

function imageFor(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  return "";
}

function distanceKm(a: Place, b: Place) {
  if (![a.lat, a.lng, b.lat, b.lng].every((value) => typeof value === "number" && Number.isFinite(value))) return null;
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians((b.lat as number) - (a.lat as number));
  const dLng = radians((b.lng as number) - (a.lng as number));
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat as number)) * Math.cos(radians(b.lat as number)) * Math.sin(dLng / 2) ** 2;
  return Number((6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))).toFixed(1));
}

export default function ItineraryClient() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [length, setLength] = useState<"سريع" | "نصف يوم" | "يوم كامل">("نصف يوم");
  const [categories, setCategories] = useState<string[]>([]);
  const [origin, setOrigin] = useState(false);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = JSON.parse(window.localStorage.getItem(ITINERARY_KEY) || "[]");
      return Array.isArray(stored) ? stored.map(Number).filter(Number.isFinite) : [];
    } catch { return []; }
  });
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("places").select("*").eq("status", "منشور").order("id", { ascending: false });
      setPlaces((data || []).filter((place: Place) => !excludedPublicCategories.has(place.category || place.main_category || "")) as Place[]);
      setLoading(false);
    };
    void load();
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(ITINERARY_KEY, JSON.stringify(selectedIds)); } catch { /* keep planner usable */ }
  }, [selectedIds]);

  const allCategories = useMemo(() => Array.from(new Set(places.map((place) => place.category || place.main_category).filter(Boolean) as string[])), [places]);
  const limit = length === "سريع" ? 2 : length === "نصف يوم" ? 3 : 5;
  const suggestions = useMemo(() => places.filter((place) => !categories.length || categories.includes(place.category || place.main_category || "")).slice(0, limit), [places, categories, limit]);
  const itinerary = useMemo(() => selectedIds.map((id) => places.find((place) => place.id === id)).filter(Boolean) as Place[], [places, selectedIds]);

  function useLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(() => { setOrigin(true); setLocating(false); }, () => setLocating(false), { enableHighAccuracy: true, timeout: 10000 });
  }

  function generateItinerary() {
    setSelectedIds(suggestions.map((place) => place.id));
    setGenerated(true);
  }

  function removeStop(id: number) { setSelectedIds((current) => current.filter((value) => value !== id)); }
  function moveStop(index: number, direction: -1 | 1) {
    setSelectedIds((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function shareItinerary() {
    const text = itinerary.map((place, index) => `${index + 1}. ${place.name}`).join("\n");
    const payload = { title: "خط رحلتي | وادنا", text: `محطات رحلتي في وادي سوف:\n${text}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else { await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`); setShareMessage("تم نسخ خط الرحلة للمشاركة"); }
    } catch { /* sharing can be cancelled by the user */ }
  }

  return <section className="itinerary-page platform-page"><div className="platform-container"><div className="app-screen-heading"><div><span className="platform-eyebrow"><i />مخطط الرحلة</span><h1>بوصلة<br /><em>وادنا.</em></h1><p>اختر وقتك واهتماماتك، وسنرتب لك بداية عملية لاكتشاف سوف.</p></div><div className="app-screen-heading__icon"><Compass size={28} /></div></div><div className="itinerary-controls"><div className="itinerary-control-card"><span><CalendarDays size={18} /> وقت الرحلة</span><div className="itinerary-segments">{["سريع", "نصف يوم", "يوم كامل"].map((item) => <button type="button" key={item} className={length === item ? "is-active" : ""} onClick={() => { setLength(item as typeof length); setGenerated(false); }}>{item}</button>)}</div></div><div className="itinerary-control-card"><div className="itinerary-control-title"><span><LocateFixed size={18} /> نقطة البداية</span><button type="button" onClick={useLocation} disabled={locating}>{locating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />} {origin ? "تم تحديد موقعك" : "استخدم موقعي"}</button></div><p>{origin ? "سيبدأ المسار من موقعك الحالي عند فتح الخريطة." : "اختياري؛ يمكنك التخطيط دون مشاركة موقعك."}</p></div></div><div className="itinerary-interest"><div className="itinerary-title-row"><div><span className="platform-eyebrow"><i />تخصيص الجولة</span><h2>ما الذي يهمك؟</h2></div><button type="button" onClick={() => setCategories([])}>مسح الاختيارات</button></div><div className="itinerary-chips">{allCategories.map((item) => <button type="button" key={item} className={categories.includes(item) ? "is-active" : ""} onClick={() => setCategories((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}>{categories.includes(item) && <Check size={13} />}{item}</button>)}</div></div><div className="itinerary-result-head"><div><span className="platform-eyebrow"><i />اقتراح اليوم</span><h2>{generated ? "مسارك المقترح" : "جاهز لاكتشاف الوادي؟"}</h2></div><div className="flex flex-wrap gap-2"><button className="platform-button platform-button--green" type="button" onClick={generateItinerary} disabled={loading}>{loading ? "جاري جلب المعالم..." : "أنشئ مساري"}<Compass size={16} /></button>{itinerary.length > 0 && <button className="platform-button platform-button--outline" type="button" onClick={shareItinerary}><Share2 size={16} /> مشاركة</button>}</div></div>{shareMessage && <p className="mt-3 text-sm font-bold text-emerald-700">{shareMessage}</p>}{generated || itinerary.length > 0 ? <div className="itinerary-list">{itinerary.map((place, index) => <article className="itinerary-stop" key={place.id}><div className="itinerary-stop__number">{index + 1}</div><img src={imageFor(place.image_url) || "/ouedna/local-architecture.webp"} alt={place.name} /><div className="itinerary-stop__body"><span>{place.category || place.main_category || "معلم سياحي"}</span><h3>{place.name}</h3><p><MapPin size={13} /> {place.municipality || "ولاية الوادي"}{index > 0 && distanceKm(itinerary[index - 1], place) !== null ? ` · ${distanceKm(itinerary[index - 1], place)} كم من المحطة السابقة` : ""}</p><div><Link href={`/place/${place.id}`}>التفاصيل</Link><Link href={`/map?placeId=${place.id}&destination=${encodeURIComponent(place.name)}`}><Navigation size={13} /> افتح المسار</Link><button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} aria-label="تحريك المحطة للأعلى"><ChevronUp size={14} /></button><button type="button" onClick={() => moveStop(index, 1)} disabled={index === itinerary.length - 1} aria-label="تحريك المحطة للأسفل"><ChevronDown size={14} /></button><button type="button" onClick={() => removeStop(place.id)} aria-label="حذف المحطة"><Trash2 size={14} /></button></div></div></article>)}{!itinerary.length && <div className="platform-empty-panel"><Compass size={28} /><h2>لا توجد معالم بهذه التصفية</h2><p>أزل بعض الاهتمامات ثم أنشئ المسار من جديد.</p></div>}</div> : <div className="itinerary-empty"><Compass size={32} /><h2>خطة تبدأ من الأماكن المنشورة</h2><p>سيجمع لك Ouedna نقاطاً مناسبة من قاعدة المعالم الحية، ويمكنك تعديلها من الخريطة.</p></div>}</div></section>;
}
