"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

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
      void fetch(`${SUPABASE_URL}/rest/v1/rpc/record_web_page_view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          p_path: pathname,
          p_visitor_key: getVisitorKey(),
          p_referrer: document.referrer || null,
        }),
        keepalive: true,
      }).catch(() => undefined);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
