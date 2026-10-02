"use client";

import { ArrowLeft, Archive, Compass, Heart, Images, MapPin, MapPinned, Plus, Search, SlidersHorizontal, Star, View, Route } from "lucide-react";
import Link from "next/link";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import TranslatedText from "@/components/platform/TranslatedText";

type Place = { id: string | number; name?: string; category?: string; description?: string; image_url?: unknown; gallery?: unknown; municipality?: string; lat?: number; lng?: number; rating?: number; virtual_tour_url?: string | null };

function imageFor(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  return "";
}

function imagesFor(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

export default function AppExploreClient({ places, dataError = "" }: { places: Place[]; dataError?: string }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("__all");
  const [location, setLocation] = useState("__all");
  const [tourOnly, setTourOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("souf360_favorites") || "[]").map(String); } catch { return []; }
  });
  const categories = useMemo(() => ["__all", ...Array.from(new Set(places.map((place) => place.category).filter(Boolean) as string[]))], [places]);
  const locations = useMemo(() => ["__all", ...Array.from(new Set(places.map((place) => place.municipality).filter(Boolean) as string[]))], [places]);
  const tourPlaces = useMemo(() => places.filter((place) => Boolean(place.virtual_tour_url)), [places]);
  const filtered = useMemo(() => places.filter((place) => {
    const haystack = `${place.name || ""} ${place.description || ""} ${place.category || ""} ${place.municipality || ""}`.toLowerCase();
    return (!tourOnly || Boolean(place.virtual_tour_url)) && (category === "__all" || place.category === category) && (location === "__all" || place.municipality === location) && (!query.trim() || haystack.includes(query.toLowerCase().trim()));
  }), [places, query, category, location, tourOnly]);
  const visiblePlaces = filtered.slice(0, visibleCount);

  function toggleFavorite(id: string | number) {
    const current = new Set(favorites);
    const key = String(id);
    if (current.has(key)) current.delete(key); else current.add(key);
    const next = [...current];
    try { localStorage.setItem("souf360_favorites", JSON.stringify(next)); } catch { /* Private browsing can block storage; keep the UI usable. */ }
    setFavorites(next);
  }

  return <main className="app-explore-redesign">
    <section className="app-explore-welcome">
      <div className="app-explore-welcome__image" aria-hidden="true" />
      <div className="app-explore-welcome__veil" />
      <div className="platform-container app-explore-welcome__content">
        <span className="app-explore-welcome__brand"><span className="app-explore-welcome__mark">✦</span> {t("exploreBrand")}</span>
        <span className="app-explore-welcome__badge">{t("exploreBadge")}</span>
        <h1>{t("exploreWelcomeTitle")}<br /><em>{t("exploreWelcomeTitleAccent")}</em></h1>
        <p>{t("exploreWelcomeDescription")}</p>
        <div className="app-explore-welcome__actions"><a href="#places" className="platform-button platform-button--amber"><Compass size={17} /> {t("startExploring")}</a><Link href="/map" className="app-explore-glass"><MapPinned size={17} /> {t("interactiveMap")}</Link></div>
      </div>
    </section>

    <section className="app-explore-quick platform-container" aria-label={t("primaryNavigation")}>
      <Link href="/itinerary" className="app-explore-quick-card app-explore-quick-card--gold"><span><Route size={22} /></span><strong>{t("itinerary")}</strong><small>{t("itineraryDesc")}</small><ArrowLeft size={16} /></Link>
      <Link href="/archive" className="app-explore-quick-card app-explore-quick-card--green"><span><Archive size={22} /></span><strong>{t("archiveMemories")}</strong><small>{t("archiveDesc")}</small><ArrowLeft size={16} /></Link>
      <Link href="/map" className="app-explore-quick-card app-explore-quick-card--blue"><span><MapPinned size={22} /></span><strong>{t("interactiveMap")}</strong><small>{t("mapDesc")}</small><ArrowLeft size={16} /></Link>
      <Link href="/suggest-place" className="app-explore-quick-card app-explore-quick-card--sand"><span><Plus size={22} /></span><strong>{t("suggestLandmark")}</strong><small>{t("suggestDesc")}</small><ArrowLeft size={16} /></Link>
    </section>

    {tourPlaces.length ? <section className="app-explore-tours app-explore-virtual platform-container"><div className="app-explore-section-head"><div><span className="platform-eyebrow"><i /> {t("virtualVisit")}</span><h2>{t("beforeYourVisit")}</h2></div><button type="button" className="app-explore-view-all" onClick={() => { setTourOnly(true); document.getElementById("places")?.scrollIntoView({ behavior: "smooth" }); }}>{t("showLandmarks")} <ArrowLeft size={15} /></button></div><div className="app-explore-tour-strip">{tourPlaces.slice(0, 6).map((place, index) => <Link href={`/place/${place.id}`} className="app-explore-tour-item" key={place.id}><LandmarkFrame src={imageFor(place.image_url) || imagesFor(place.gallery)[0] || "/ouedna/local-architecture.webp"} alt={`${place.name || t("unknownLandmark")} — ${place.municipality || ""}`} variant="thumb" tour index={index} /><span><b><TranslatedText text={place.name} fallback={t("unknownLandmark")} /></b><small><TranslatedText text={place.municipality} /></small></span><ArrowLeft size={17} /></Link>)}</div></section> : null}

    <section id="places" className="app-explore-directory platform-container">
      <div className="app-explore-section-head"><div><span className="platform-eyebrow"><i /> {t("exploreDirectory")}</span><h2>{t("exploreDirectoryTitle")}</h2><p>{t("exploreDirectoryDescription")}</p></div><div className="app-explore-count"><strong>{filtered.length}</strong><small>{t("availableLandmarks")}</small></div></div>
      <div className="app-explore-controls"><label className="app-explore-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} placeholder={t("exploreSearchPlaceholder")} aria-label={t("exploreSearchPlaceholder")} /></label><div className="app-explore-filter-label"><SlidersHorizontal size={16} /> {t("filterByInterest")}</div><div className="app-explore-categories"><button type="button" className={tourOnly ? "is-active" : ""} aria-pressed={tourOnly} onClick={() => { setTourOnly(!tourOnly); setVisibleCount(12); }}><View size={14} /> {t("tour360")} ({tourPlaces.length})</button>{categories.map((item) => <button type="button" key={item} className={category === item && !tourOnly ? "is-active" : ""} aria-pressed={category === item && !tourOnly} onClick={() => { setCategory(item); setTourOnly(false); setVisibleCount(12); }}><TranslatedText text={item === "__all" ? undefined : item} fallback={item === "__all" ? t("categoryAll") : ""} /></button>)}</div><div className="app-explore-filter-label"><MapPin size={16} /> {t("filterByLocation")}</div><div className="app-explore-categories">{locations.map((item) => <button type="button" key={item} className={location === item ? "is-active" : ""} aria-pressed={location === item} onClick={() => { setLocation(item); setVisibleCount(12); }}><TranslatedText text={item === "__all" ? undefined : item} fallback={item === "__all" ? t("allLocations") : ""} /></button>)}</div></div>
      {dataError ? <div className="app-explore-error" role="alert"><Search size={26} /><div><h2>{t("noExploreResults")}</h2><p>{dataError}</p></div><button type="button" onClick={() => window.location.reload()}>{t("retry")}</button></div> : filtered.length ? <><div className="app-explore-grid">{visiblePlaces.map((place, index) => { const image = imageFor(place.image_url) || imagesFor(place.gallery)[0] || "/ouedna/local-architecture.webp"; const gallery = [...new Set([image, ...imagesFor(place.gallery), ...imagesFor(place.image_url)])]; const saved = favorites.includes(String(place.id)); const mapParams = new URLSearchParams({ placeId: String(place.id), destination: place.name || "" }); if (Number.isFinite(place.lat)) mapParams.set("lat", String(place.lat)); if (Number.isFinite(place.lng)) mapParams.set("lng", String(place.lng)); return <article className="app-place-card" key={place.id}><Link href={`/place/${place.id}`} className="app-place-card__visual"><LandmarkFrame src={image} alt={`${place.name || t("unknownLandmark")} — ${place.municipality || ""}`} category={place.category || t("landmarks")} tour={Boolean(place.virtual_tour_url)} index={index} />{gallery.length > 1 && <span className="app-place-card__gallery"><Images size={13} /> {gallery.length}</span>}</Link><button className={`app-place-card__favorite${saved ? " is-active" : ""}`} type="button" aria-label={saved ? t("removeFromFavorites") : t("addToFavorites")} aria-pressed={saved} onClick={() => toggleFavorite(place.id)}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button><div className="app-place-card__body"><Link href={`/place/${place.id}`}><h3><TranslatedText text={place.name} fallback={t("unknownLandmark")} /></h3></Link><p><MapPin size={14} /> <TranslatedText text={place.municipality} /></p><small><TranslatedText text={place.description} fallback={t("noDescription")} /></small><div className="app-place-card__footer"><span><Star size={13} fill="currentColor" /> {place.rating ? Number(place.rating).toFixed(1) : t("newPlace")}</span><Link className="app-place-card__map-link" href={`/map?${mapParams.toString()}`}><MapPinned size={14} /> {t("openMap")} <ArrowLeft size={13} /></Link></div></div></article>; })}</div>{visiblePlaces.length < filtered.length && <button type="button" className="platform-button platform-button--green mx-auto mt-8 flex" onClick={() => setVisibleCount((current) => current + 12)}>{t("loadMoreLandmarks")}</button>}</> : <div className="platform-empty-panel app-explore-empty"><Search size={28} /><h2>{t("noExploreResults")}</h2><p>{t("tryAnotherFilter")}</p><button className="platform-button platform-button--green" type="button" onClick={() => { setQuery(""); setCategory("__all"); setLocation("__all"); setTourOnly(false); setVisibleCount(12); }}>{t("resetFilters")}</button></div>}
      <div className="app-explore-bottom-cta"><span><strong>{t("suggestPrompt")}</strong><small>{t("suggestPromptDesc")}</small></span><Link href="/suggest-place" className="platform-button platform-button--amber">{t("suggestLandmark")}</Link></div>
    </section>
  </main>;
}
