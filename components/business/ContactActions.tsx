"use client";

import { Globe2, MapPinned, MessageCircle, Phone } from "lucide-react";
import { safeHttpUrl, telHref, trackContactClick, whatsappNumber, type ContactAction, type ContactTarget } from "@/lib/contact";

type Props = {
  target: ContactTarget;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  mapLink?: string | null;
  lat?: number | null;
  lng?: number | null;
  compact?: boolean;
};

/** Call / WhatsApp / website / directions buttons. Every click is counted so owners can see real results. */
export default function ContactActions({ target, name, phone, whatsapp, website, mapLink, lat, lng, compact = false }: Props) {
  const tel = telHref(phone);
  const wa = whatsappNumber(whatsapp || phone);
  const site = safeHttpUrl(website);
  const directions = safeHttpUrl(mapLink) || (typeof lat === "number" && typeof lng === "number" ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : null);
  if (!tel && !wa && !site && !directions) return null;

  const track = (action: ContactAction) => () => trackContactClick(target, action);
  const cls = (primary = false) => `platform-button ${primary ? "platform-button--green" : "platform-button--outline"}`;
  const size = compact ? 15 : 17;
  const waText = encodeURIComponent(`مرحباً، وجدت ${name} على منصة وادنا وأرغب في الاستفسار.`);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={`التواصل مع ${name}`}>
      {tel && <a className={cls(true)} href={tel} onClick={track("call")}><Phone size={size} /> اتصال</a>}
      {wa && <a className={cls()} href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer" onClick={track("whatsapp")}><MessageCircle size={size} /> واتساب</a>}
      {site && <a className={cls()} href={site} target="_blank" rel="noopener noreferrer nofollow" onClick={track("website")}><Globe2 size={size} /> الموقع</a>}
      {directions && <a className={cls()} href={directions} target="_blank" rel="noopener noreferrer" onClick={track("directions")}><MapPinned size={size} /> الاتجاهات</a>}
    </div>
  );
}
