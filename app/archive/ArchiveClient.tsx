"use client";

import { Image as ImageIcon } from "lucide-react";
import PageHero from "@/components/platform/PageHero";
import TranslatedText from "@/components/platform/TranslatedText";
import { useLanguage } from "@/lib/i18n";

type Memory = { id: string; caption?: string | null; year?: string | number | null; images: string[] };

export default function ArchiveClient({ memories }: { memories: Memory[] }) {
  const { t } = useLanguage();
  return (
    <>
      <PageHero eyebrow="archiveEyebrow" title="archiveHeroTitle" description="archiveHeroDescription" image="/ouedna/local-architecture.webp" imageAlt="archiveImageAlt" />
      <div className="platform-container platform-archive-content">
        <div className="platform-archive-intro"><span>{memories.length}</span><p>{t("archivePublished")}</p></div>
        {memories.length ? (
          <div className="platform-archive-grid">
            {memories.map((memory) => (
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
          <div className="platform-empty-panel"><ImageIcon size={28} /><h2>{t("archiveEmptyTitle")}</h2><p>{t("archiveEmptyDescription")}</p></div>
        )}
      </div>
    </>
  );
}
