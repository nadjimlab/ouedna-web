"use client";

import { useAutoTranslate } from "@/lib/i18n";

export default function TranslatedText({ text, fallback = "" }: { text?: string | null; fallback?: string }) {
  const value = useAutoTranslate(text || fallback);
  return <>{value || fallback}</>;
}
