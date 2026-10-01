"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const VISITOR_KEY = "ouedna.analytics.visitor";

function getVisitorKey() {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const generated = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_KEY, generated);
    return generated;
  } catch {
    return null;
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const timer = window.setTimeout(() => {
      void supabase.rpc("record_web_page_view", {
        p_path: pathname,
        p_visitor_key: getVisitorKey(),
        p_referrer: document.referrer || null,
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
