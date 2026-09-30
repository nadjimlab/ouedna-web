"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { useLanguage, type DictKey } from "@/lib/i18n";

export default function PageHero({ eyebrow, title, description, image, imageAlt, actionHref, actionKey }: { eyebrow: DictKey; title: DictKey; description: DictKey; image: string; imageAlt: DictKey; actionHref?: string; actionKey?: DictKey }) {
  const { t } = useLanguage();
  return <section className="ouedna-page-hero" style={{ "--page-hero-image": `url(${image})` } as CSSProperties}>
    <div className="ouedna-page-hero__veil" />
    <div className="platform-container ouedna-page-hero__content">
      <span className="platform-eyebrow"><i />{t(eyebrow)}</span>
      <h1>{t(title)}</h1>
      <p>{t(description)}</p>
      {actionHref && actionKey ? <Link href={actionHref} className="platform-button platform-button--amber"><Compass size={16} />{t(actionKey)}<ArrowLeft size={14} /></Link> : null}
      <span className="sr-only">{t(imageAlt)}</span>
    </div>
  </section>;
}
