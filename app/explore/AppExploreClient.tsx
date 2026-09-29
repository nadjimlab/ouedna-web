"use client";

import {
  Compass,
  Heart,
  MapPin,
  Search,
  Star,
  ArrowLeft,
  MapPinned,
  Sparkles,
  View,
  Route,
  Archive,
  Plus,
  SlidersHorizontal,
  Images,
} from "lucide-react";
import Link from "next/link";
import LandmarkFrame from "@/components/platform/LandmarkFrame";
import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type Place = {
  id: string | number;
  name?: string;
  category?: string;
  description?: string;
  image_url?: unknown;
  gallery?: unknown;
  municipality?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  virtual_tour_url?: string | null;
};

function imageFor(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") {
    return (
      value
        .replace(/[\[\]"']/g, "")
        .split(",")[0]
        ?.trim() || ""
    );
  }
  return "";
}

function imagesFor(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .replace(/[\[\]"']/g, "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function AppExploreClient({
  places,
  dataError = "",
}: {
  places: Place[];
  dataError?: string;
}) {
  const [query, setQuery] = useState("");
  const { t, lang } = useLanguage();

  const [category, setCategory] = useState("all");

  const [tourOnly, setTourOnly] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return JSON.parse(
        window.localStorage.getItem("souf360_favorites") || "[]"
      ).map(String);
    } catch {
      return [];
    }
  });

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          places
            .map((place) => place.category)
            .filter(Boolean) as string[]
        )
      ),
    ],
    [places]
  );

  const tourPlaces = useMemo(
    () => places.filter((place) => place.virtual_tour_url),
    [places]
  );

  const virtualPlaces = useMemo(
    () =>
      places
        .filter(
          (place) =>
            imageFor(place.image_url) ||
            imagesFor(place.gallery).length
        )
        .slice(0, 6),
    [places]
  );

  const filtered = useMemo(
    () =>
      places.filter((place) => {
        const haystack =
          `${place.name || ""} ${place.description || ""} ${
            place.category || ""
          } ${place.municipality || ""}`.toLowerCase();

        return (
          (!tourOnly || Boolean(place.virtual_tour_url)) &&
          (category === "all" || place.category === category) &&
          (!query.trim() ||
            haystack.includes(query.toLowerCase().trim()))
        );
      }),
    [places, query, category, tourOnly]
  );

  function toggleFavorite(id: string | number) {
    const current = new Set(favorites);
    const key = String(id);

    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }

    const next = [...current];

    localStorage.setItem(
      "souf360_favorites",
      JSON.stringify(next)
    );

    setFavorites(next);
  }

  const text = {
    welcome:
      lang === "fr"
        ? "Bienvenue au cœur du désert"
        : lang === "en"
          ? "Welcome to the heart of the desert"
          : "مرحباً بك في قلب الصحراء",

    intro:
      lang === "fr"
        ? "Des coupoles historiques aux oasis verdoyantes au milieu des sables dorés. Planifiez votre voyage et découvrez les lieux qui vous intéressent."
        : lang === "en"
          ? "From historic domes to green oases amid golden sands. Plan your trip and discover the places that matter to you."
          : "من القباب التاريخية إلى الواحات الخضراء وسط الرمال الذهبية. خطط رحلتك واكتشف الأماكن التي تهمك.",

    explore:
      lang === "fr"
        ? "Commencer l’exploration"
        : lang === "en"
          ? "Start exploring"
          : "ابدأ الاستكشاف",

    map:
      lang === "fr"
        ? "Carte interactive"
        : lang === "en"
          ? "Interactive map"
          : "الخريطة التفاعلية",

    trip:
      lang === "fr"
        ? "Mon itinéraire"
        : lang === "en"
          ? "My trip"
          : "خط رحلتي",

    archive:
      lang === "fr"
        ? "Archives et souvenirs"
        : lang === "en"
          ? "Archive & memories"
          : "أرشيف وذكريات",

    suggest:
      lang === "fr"
        ? "Suggérer un lieu"
        : lang === "en"
          ? "Suggest a place"
          : "اقترح معلماً",

    virtual:
      lang === "fr"
        ? "Visite virtuelle"
        : lang === "en"
          ? "Virtual tour"
          : "زيارة افتراضية",

    guide:
      lang === "fr"
        ? "Guide Ouedna"
        : lang === "en"
          ? "Ouedna guide"
          : "دليل وادنا",

    discover:
      lang === "fr"
        ? "Découvrez les lieux qui vous ressemblent."
        : lang === "en"
          ? "Discover places that feel like you."
          : "اكتشف الأماكن التي تشبهك.",

    search:
      lang === "fr"
        ? "Rechercher un site, une oasis, un marché..."
        : lang === "en"
          ? "Search for a landmark, oasis, market..."
          : "ابحث عن معلم، واحة، سوق...",

    all:
      lang === "fr"
        ? "Tous"
        : lang === "en"
          ? "All"
          : "الكل",

    available:
      lang === "fr"
        ? "sites disponibles"
        : lang === "en"
          ? "places available"
          : "معلم متاح",

    retry:
      lang === "fr"
        ? "Réessayer"
        : lang === "en"
          ? "Retry"
          : "إعادة المحاولة",

    noResults:
      lang === "fr"
        ? "Aucun résultat"
        : lang === "en"
          ? "No results"
          : "لا توجد نتائج",

    reset:
      lang === "fr"
        ? "Réinitialiser"
        : lang === "en"
          ? "Reset filters"
          : "إعادة التصفية",
  };

  return (
    <main className="app-explore-redesign">

      {/* HERO */}
      <section className="app-explore-welcome">
        <div
          className="app-explore-welcome__image"
          aria-hidden="true"
        />

        <div
          className="app-explore-welcome__veil"
          aria-hidden="true"
        />

        <div className="platform-container app-explore-welcome__content">

          <span className="app-explore-welcome__brand">
            <span className="app-explore-welcome__mark">
              ✦
            </span>

            وادنا · {t("brandTagline")}
          </span>

          <span className="app-explore-welcome__badge">
            {t("heroBadge")}
          </span>

          <h1>
            {text.welcome}
          </h1>

          <p>
            {text.intro}
          </p>

          <div className="app-explore-welcome__actions">

            <a
              href="#places"
              className="platform-button platform-button--amber"
            >
              <Compass size={17} />
              {text.explore}
            </a>

            <Link
              href="/map"
              className="app-explore-glass"
            >
              <MapPinned size={17} />
              {text.map}
            </Link>

          </div>

        </div>
      </section>

      {/* QUICK LINKS */}
      <section
        className="app-explore-quick platform-container"
        aria-label={text.guide}
      >

        <Link
          href="/itinerary"
          className="app-explore-quick-card app-explore-quick-card--gold"
        >
          <span>
            <Route size={22} />
          </span>

          <strong>{text.trip}</strong>

          <small>
            {lang === "fr"
              ? "Planifiez votre journée"
              : lang === "en"
                ? "Plan your day easily"
                : "خطط يومك بسهولة"}
          </small>

          <ArrowLeft size={16} />
        </Link>

        <Link
          href="/archive"
          className="app-explore-quick-card app-explore-quick-card--green"
        >
          <span>
            <Archive size={22} />
          </span>

          <strong>{text.archive}</strong>

          <small>
            {lang === "fr"
              ? "Découvrez l’histoire du Souf"
              : lang === "en"
                ? "Discover Souf history"
                : "اكتشف تاريخ وادي سوف"}
          </small>

          <ArrowLeft size={16} />
        </Link>

        <Link
          href="/map"
          className="app-explore-quick-card app-explore-quick-card--blue"
        >
          <span>
            <MapPinned size={22} />
          </span>

          <strong>{text.map}</strong>

          <small>
            {lang === "fr"
              ? "Itinéraires touristiques"
              : lang === "en"
                ? "Tourist routes"
                : "مسارات سياحية دقيقة"}
          </small>

          <ArrowLeft size={16} />
        </Link>

        <Link
          href="/suggest-place"
          className="app-explore-quick-card app-explore-quick-card--sand"
        >
          <span>
            <Plus size={22} />
          </span>

          <strong>{text.suggest}</strong>

          <small>
            {lang === "fr"
              ? "Ajoutez un lieu au guide"
              : lang === "en"
                ? "Add a place to the guide"
                : "أضف مكاناً للدليل"}
          </small>

          <ArrowLeft size={16} />
        </Link>

      </section>

      {/* VIRTUAL TOURS */}
      {virtualPlaces.length > 0 && (
        <section className="app-explore-tours app-explore-virtual platform-container">

          <div className="app-explore-section-head">

            <div>
              <span className="platform-eyebrow">
                <i />
                {text.virtual}
              </span>

              <h2>
                {lang === "fr"
                  ? <>Découvrez les sites<br /><em>avant votre visite.</em></>
                  : lang === "en"
                    ? <>See landmarks<br /><em>before you visit.</em></>
                    : <>شاهد المعالم<br /><em>قبل الزيارة.</em></>}
              </h2>
            </div>

            <button
              type="button"
              className="app-explore-view-all"
              onClick={() =>
                document
                  .getElementById("places")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              {text.discover}
              <ArrowLeft size={15} />
            </button>

          </div>

          <div className="app-explore-tour-strip">

            {virtualPlaces.map((place, index) => (
              <Link
                href={`/place/${place.id}`}
                className="app-explore-tour-item"
                key={place.id}
              >

                <LandmarkFrame
                  src={
                    imageFor(place.image_url) ||
                    imagesFor(place.gallery)[0] ||
                    "/ouedna/local-architecture.webp"
                  }
                  alt={`${place.name || "معلم"} — ${
                    place.municipality || "ولاية الوادي"
                  }`}
                  variant="thumb"
                  tour={Boolean(place.virtual_tour_url)}
                  index={index}
                />

                <span>
                  <b>
                    {place.name ||
                      (lang === "fr"
                        ? "Site du Souf"
                        : lang === "en"
                          ? "Souf landmark"
                          : "معلم من وادي سوف")}
                  </b>

                  <small>
                    {place.municipality ||
                      (lang === "fr"
                        ? "El Oued"
                        : lang === "en"
                          ? "El Oued"
                          : "ولاية الوادي")}
                  </small>
                </span>

                <ArrowLeft size={17} />

              </Link>
            ))}

          </div>

        </section>
      )}

      {/* DIRECTORY */}
      <section
        id="places"
        className="app-explore-directory platform-container"
      >

        <div className="app-explore-section-head">

          <div>

            <span className="platform-eyebrow">
              <i />
              {text.guide}
            </span>

            <h2>
              {text.discover}
            </h2>

            <p>
              {lang === "fr"
                ? "Recherchez votre prochaine destination et ajoutez-la à votre voyage."
                : lang === "en"
                  ? "Find your next destination and save it to your journey."
                  : "ابحث عن وجهتك القادمة واحفظها ضمن رحلتك."}
            </p>

          </div>

          <div className="app-explore-count">
            <strong>{filtered.length}</strong>
            <small>{text.available}</small>
          </div>

        </div>

        {/* CONTROLS */}
        <div className="app-explore-controls">

          <label className="app-explore-search">
            <Search size={18} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder={text.search}
              aria-label={text.search}
            />
          </label>

          <div className="app-explore-filter-label">
            <SlidersHorizontal size={16} />

            {lang === "fr"
              ? "Filtrer"
              : lang === "en"
                ? "Filter"
                : "تصفية حسب الاهتمام"}
          </div>

          <div className="app-explore-categories">

            <button
              type="button"
              className={
                tourOnly ? "is-active" : ""
              }
              onClick={() =>
                setTourOnly(!tourOnly)
              }
            >
              <View size={14} />

              360° ({tourPlaces.length})
            </button>

            {categories.map((item) => {

              const active =
                category === item && !tourOnly;

              return (
                <button
                  type="button"
                  key={item}
                  className={
                    active ? "is-active" : ""
                  }
                  onClick={() => {
                    setCategory(item);
                    setTourOnly(false);
                  }}
                >
                  {item === "all"
                    ? text.all
                    : item}
                </button>
              );
            })}

          </div>
        </div>

        {/* ERROR */}
        {dataError ? (
          <div
            className="app-explore-error"
            role="alert"
          >
            <Search size={26} />

            <div>
              <h2>
                {lang === "fr"
                  ? "Impossible de charger les lieux"
                  : lang === "en"
                    ? "Unable to load places"
                    : "تعذر تحميل الأماكن"}
              </h2>

              <p>{dataError}</p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              {text.retry}
            </button>
          </div>
        ) : filtered.length ? (

          <div className="app-explore-grid">

            {filtered.map((place, index) => {

              const image =
                imageFor(place.image_url) ||
                "/ouedna/local-architecture.webp";

              const gallery = [
                ...new Set([
                  image,
                  ...imagesFor(place.gallery),
                  ...imagesFor(place.image_url),
                ]),
              ];

              const saved =
                favorites.includes(
                  String(place.id)
                );

              return (
                <article
                  className="app-place-card"
                  key={place.id}
                >

                  <Link
                    href={`/place/${place.id}`}
                    className="app-place-card__visual"
                  >

                    <LandmarkFrame
                      src={image}
                      alt={`${place.name || "معلم"} — ${
                        place.municipality ||
                        "ولاية الوادي"
                      }`}
                      category={
                        place.category ||
                        "معلم سياحي"
                      }
                      tour={Boolean(
                        place.virtual_tour_url
                      )}
                      index={index}
                    />

                    {gallery.length > 1 && (
                      <span className="app-place-card__gallery">
                        <Images size={13} />
                        {gallery.length}{" "}
                        {lang === "fr"
                          ? "photos"
                          : lang === "en"
                            ? "photos"
                            : "صور"}
                      </span>
                    )}

                  </Link>

                  <button
                    className={`app-place-card__favorite${
                      saved ? " is-active" : ""
                    }`}
                    type="button"
                    aria-label={
                      saved
                        ? t("removeFromFavorites")
                        : t("addToFavorites")
                    }
                    onClick={() =>
                      toggleFavorite(place.id)
                    }
                  >
                    <Heart
                      size={17}
                      fill={
                        saved
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                  <div className="app-place-card__body">

                    <Link
                      href={`/place/${place.id}`}
                    >
                      <h3>
                        {place.name ||
                          (lang === "fr"
                            ? "Site du Souf"
                            : lang === "en"
                              ? "Souf landmark"
                              : "معلم من وادي سوف")}
                      </h3>
                    </Link>

                    <p>
                      <MapPin size={14} />

                      {place.municipality ||
                        (lang === "fr"
                          ? "El Oued"
                          : lang === "en"
                            ? "El Oued"
                            : "ولاية الوادي")}
                    </p>

                    <small>
                      {place.description ||
                        (lang === "fr"
                          ? "Découvrez les détails de ce site dans le guide Ouedna."
                          : lang === "en"
                            ? "Discover this landmark in the Ouedna guide."
                            : "اكتشف تفاصيل هذا المعلم من دليل وادنا.")}
                    </small>

                    <div className="app-place-card__footer">

                      <span>
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        {place.rating
                          ? Number(
                              place.rating
                            ).toFixed(1)
                          : lang === "fr"
                            ? "Nouveau"
                            : lang === "en"
                              ? "New"
                              : "جديد"}
                      </span>

                      <Link
                        className="app-place-card__map-link"
                        href={`/map?placeId=${
                          place.id
                        }&destination=${encodeURIComponent(
                          place.name || ""
                        )}`}
                      >
                        <MapPinned size={14} />

                        {lang === "fr"
                          ? "Ouvrir la carte"
                          : lang === "en"
                            ? "Open map"
                            : "افتح الخريطة"}

                        <ArrowLeft size={13} />
                      </Link>

                    </div>
                  </div>

                </article>
              );
            })}

          </div>

        ) : (

          <div className="platform-empty-panel app-explore-empty">

            <Search size={28} />

            <h2>{text.noResults}</h2>

            <p>
              {lang === "fr"
                ? "Essayez une autre catégorie ou un autre terme."
                : lang === "en"
                  ? "Try another category or search term."
                  : "جرّب تصنيفاً آخر أو اكتب كلمة بحث مختلفة."}
            </p>

            <button
              className="platform-button platform-button--green"
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setTourOnly(false);
              }}
            >
              {text.reset}
            </button>

          </div>
        )}

        {/* BOTTOM CTA */}
        <div className="app-explore-bottom-cta">

          <Sparkles size={20} />

          <span>
            <strong>
              {lang === "fr"
                ? "Vous connaissez un lieu absent ?"
                : lang === "en"
                  ? "Know a place we're missing?"
                  : "تعرف معلماً غير موجود؟"}
            </strong>

            <small>
              {lang === "fr"
                ? "Aidez-nous à enrichir le guide local."
                : lang === "en"
                  ? "Help us enrich the local Ouedna guide."
                  : "ساعدنا في إثراء دليل وادنا المحلي."}
            </small>
          </span>

          <Link
            href="/suggest-place"
            className="platform-button platform-button--amber"
          >
            {text.suggest}
          </Link>

        </div>

      </section>
    </main>
  );
}
