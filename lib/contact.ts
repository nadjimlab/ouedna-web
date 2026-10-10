import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export type ContactAction = "call" | "whatsapp" | "website" | "directions" | "booking";
export type ContactTarget = { type: "place" | "agency"; id: string | number };

/** Digits-only international number for wa.me links. Algerian local numbers (0XXXXXXXXX) become 213XXXXXXXXX. */
export function whatsappNumber(raw?: string | null): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `213${digits.slice(1)}`;
  return digits.length >= 9 && digits.length <= 15 ? digits : null;
}

/** Only allow http(s) links coming from the database. */
export function safeHttpUrl(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function telHref(raw?: string | null): string | null {
  const cleaned = (raw || "").replace(/[^\d+]/g, "");
  return cleaned.length >= 6 ? `tel:${cleaned}` : null;
}

const VISITOR_KEY = "ouedna.analytics.visitor";
function visitorKey() {
  try {
    return window.localStorage.getItem(VISITOR_KEY);
  } catch {
    return null;
  }
}

/** Fire-and-forget click tracking. Never throws and never blocks navigation. */
export function trackContactClick(target: ContactTarget, action: ContactAction) {
  try {
    void fetch(`${SUPABASE_URL}/rest/v1/rpc/record_contact_click`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ p_target_type: target.type, p_target_id: String(target.id), p_action: action, p_visitor_key: visitorKey(), p_path: window.location.pathname }),
    }).catch(() => undefined);
  } catch {
    /* tracking must never break the page */
  }
}
