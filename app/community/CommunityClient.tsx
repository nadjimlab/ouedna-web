"use client";

import { Camera, CheckCircle2, Image as ImageIcon, LoaderCircle, MessageSquareHeart, Send, Star } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

type Experience = { id: string | number; name?: string | null; message: string; photos?: unknown; created_at?: string };
function images(value: unknown) { if (Array.isArray(value)) return value.map(String).filter(Boolean); if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",").map((item) => item.trim()).filter(Boolean); return []; }

export default function CommunityClient({ experiences }: { experiences: Experience[] }) {
  const { t, lang } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(""); const [message, setMessage] = useState(""); const [files, setFiles] = useState<File[]>([]); const [sending, setSending] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState("");
  const submit = async () => {
    if (!message.trim()) { setError(t("messageRequired")); return; }
    setSending(true); setError("");
    try {
      const selected = files.slice(0, 5);
      if (selected.some((file) => !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)) throw new Error(t("sendError"));
      const photoUrls: string[] = [];
      for (const file of selected) { const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_"); const path = `testimonials/${Date.now()}-${safeName}`; const upload = await supabase.storage.from("testimonials-photos").upload(path, file, { cacheControl: "3600", upsert: false }); if (upload.error) throw upload.error; photoUrls.push(supabase.storage.from("testimonials-photos").getPublicUrl(path).data.publicUrl); }
      const insert = await supabase.from("testimonials").insert({ name: name.trim() || null, message: message.trim(), photos: photoUrls, status: "pending" }); if (insert.error) throw insert.error;
      setDone(true); setName(""); setMessage(""); setFiles([]); if (fileRef.current) fileRef.current.value = "";
    } catch (caught) { setError(caught instanceof Error && caught.message === t("sendError") ? caught.message : t("sendError")); } finally { setSending(false); }
  };
  return <div className="platform-community-layout"><div className="platform-community-feed"><div className="platform-community-feed__head"><div><span className="platform-eyebrow">{t("publishedAfterReview")}</span><h2>{t("inspireYou")}</h2></div><span><Star size={13} /> {experiences.length} {t("experienceCount")}</span></div><div className="platform-experience-list">{experiences.length ? experiences.map((item) => <article className="platform-experience-card" key={item.id}><span className="platform-experience-card__quote">“</span><p>{item.message}</p><footer><strong>{item.name || t("visitorFallbackName")}</strong><small>{item.created_at ? new Date(item.created_at).toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US") : ""}</small></footer>{images(item.photos).length ? <div className="platform-experience-card__photos">{images(item.photos).slice(0, 4).map((photo) => <img key={photo} src={photo} alt={t("visitorPhotoAlt")} loading="lazy" />)}</div> : null}</article>) : <div className="platform-empty-panel"><MessageSquareHeart size={28} /><h2>{t("firstShareTitle")}</h2><p>{t("firstShareDescription")}</p></div>}</div></div><aside className="platform-community-panel"><div className="platform-community-form-head"><Camera size={22} /><h2>{t("shareJourney")}</h2><p>{t("reviewBeforePublish")}</p></div>{done ? <div className="platform-community-success"><CheckCircle2 size={30} /><h3>{t("thankYou")}</h3><p>{t("receivedForReview")}</p><button type="button" onClick={() => setDone(false)}>{t("addAnother")}</button></div> : <div className="platform-community-form"><label>{t("nameOptional")}<input value={name} onChange={(event) => setName(event.target.value)} placeholder={t("namePlaceholder")} /></label><label>{t("yourExperience")}<textarea required aria-invalid={Boolean(error)} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("experiencePlaceholder")} rows={5} /></label><label className="platform-file-input"><ImageIcon size={16} />{files.length ? `${files.length} ${t("photosSelected")}` : t("attachPhotos")}<input ref={fileRef} type="file" accept="image/*" multiple onChange={(event) => setFiles(event.target.files ? Array.from(event.target.files).slice(0, 5) : [])} /></label>{error && <p className="platform-form-notice" role="alert">{error}</p>}<button type="button" className="platform-button platform-button--amber" disabled={sending} aria-busy={sending} onClick={submit}>{sending ? <LoaderCircle className="platform-spin" size={16} /> : <Send size={16} />}{sending ? t("sending") : t("submitForReview")}</button></div>}</aside></div>;
}
