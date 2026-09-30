"use client";

import { Check, Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function PlaceDetailActions({ id, name }: { id: string; name: string }) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const values = JSON.parse(localStorage.getItem("souf360_favorites") || "[]").map(String);
        setSaved(values.includes(id));
      } catch {
        setSaved(false);
      }
    });
  }, [id]);

  function toggle() {
    try {
      const values = new Set(JSON.parse(localStorage.getItem("souf360_favorites") || "[]").map(String));
      if (values.has(id)) values.delete(id); else values.add(id);
      localStorage.setItem("souf360_favorites", JSON.stringify([...values]));
      setSaved(values.has(id));
    } catch {
      // Storage can be unavailable in private browsing; keep the action harmless.
    }
  }

  async function share() {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: name, text: `${t("explore")} ${name} — Ouedna`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // User cancellation and blocked clipboard are non-fatal.
    }
  }

  return <div className="place-detail-actions">
    <button type="button" className={`platform-button ${saved ? "platform-button--amber" : "platform-button--outline"}`} onClick={toggle} aria-pressed={saved}>
      <Heart size={17} fill={saved ? "currentColor" : "none"} />{saved ? t("saved") : t("addToFavorites")}
    </button>
    <button type="button" className="place-share-button" onClick={share}>
      {copied ? <Check size={17} /> : <Share2 size={17} />}{copied ? t("linkCopied") : t("shareLandmark")}
    </button>
  </div>;
}
