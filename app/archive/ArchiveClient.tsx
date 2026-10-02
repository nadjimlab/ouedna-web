"use client";

import { Image as ImageIcon, Search, SlidersHorizontal } from "lucide-react";
import PageHero from "@/components/platform/PageHero";
import TranslatedText from "@/components/platform/TranslatedText";
import { useLanguage } from "@/lib/i18n";
import { useMemo, useState } from "react";

type Memory = { id: string; caption?: string | null; year?: string | number | null; images: string[] };

export default function ArchiveClient({ memories }: { memories: Memory[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("__all");
  const years = useMemo(() => ["__all", ...Array.from(new Set(memories.map((memory) => String(memory.year || "")).filter((value) => value !== ""))).sort().reverse()], [memories]);
  const filteredMemories = useMemo(() => memories.filter((memory) => {
    const haystack = `${memory.caption || ""} ${memory.year || ""}`.toLowerCase();
    return (year === "__all" || String(memory.year || "") === year) && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
  }), [memories, query, year]);
  return (
    <>
      <PageHero eyebrow="archiveEyebrow" title="archiveHeroTitle" description="archiveHeroDescription" image="/ouedna/local-architecture.webp" imageAlt="archiveImageAlt" />
      <div className="platform-container platform-archive-content">
        <div className="platform-archive-intro"><span>{filteredMemories.length}</span><p>{t("archivePublished")}</p></div>
        <div className="mb-8 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
          <label className="flex items-center gap-3 rounded-xl border border-[#173b35]/10 bg-white/65 px-4 py-3 text-[#173b35]">
            <Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في الصور والقصص..." aria-label="ابحث في الأرشيف" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </label>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold"><SlidersHorizontal size={15} /><button type="button" className={`rounded-full px-3 py-2 ${year === "__all" ? "bg-[#D6A653] text-[#2f2519]" : "bg-white/70 text-[#173b35]"}`} onClick={() => setYear("__all")}>كل السنوات</button>{years.filter((item) => item !== "__all").map((item) => <button type="button" key={item} className={`rounded-full px-3 py-2 ${year === item ? "bg-[#D6A653] text-[#2f2519]" : "bg-white/70 text-[#173b35]"}`} onClick={() => setYear(item)}>{item}</button>)}</div>
        </div>
        {filteredMemories.length ? (
          <div className="platform-archive-grid">
            {filteredMemories.map((memory) => (
              <article className="platform-archive-card" key={memory.id}>
                <img src={memory.images[0]} alt={memory.caption || t("archiveImageAlt")} loading="lazy" />
                <div className="platform-archive-card__content">
                  <span>{memory.year || "—"}</span>
                  <h2><TranslatedText text={memory.caption} fallback={t("archiveImageAlt")} /></h2>
                  <p>{memory.images.length} {t("archiveVerified")}</p>
                </div>
                {memory.images.length > 1 ? (
                  <div className="platform-archive-card__gallery" aria-label={`${memory.images.length} ${t("archiveVerified")}`}>
                    <img src={memory.images[1]} alt={t("archiveImageAlt")} loading="lazy" />
                    {memory.images.length > 2 ? <span>+{memory.images.length - 2}</span> : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="platform-empty-panel"><ImageIcon size={28} /><h2>{memories.length ? "لا توجد نتائج بهذا البحث" : t("archiveEmptyTitle")}</h2><p>{memories.length ? "جرّب كلمة بحث أو سنة مختلفة." : t("archiveEmptyDescription")}</p></div>
        )}
      </div>
    </>
  );
}
