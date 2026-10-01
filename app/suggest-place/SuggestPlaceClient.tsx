"use client";

import { Camera, CheckCircle2, ExternalLink, Link2, LoaderCircle, MapPin, Send } from "lucide-react";
import { useRef, useState } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

function extractCoordinates(value: string) {
  const patterns = [
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
      return { latitude: String(latitude), longitude: String(longitude) };
    }
  }
  return null;
}

export default function SuggestPlaceClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notice, setNotice] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
  const [coordinatesDetected, setCoordinatesDetected] = useState(false);

  function handleMapLinkChange(value: string) {
    setMapLink(value);
    const extracted = extractCoordinates(value);
    if (extracted) {
      setCoordinates(extracted);
      setCoordinatesDetected(true);
    } else {
      setCoordinatesDetected(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = fileRef.current?.files?.[0];
    if (file && file.size > 8 * 1024 * 1024) {
      setNotice("حجم الصورة يجب ألا يتجاوز 8 ميغابايت.");
      return;
    }
    setSending(true);
    setNotice("");
    setSuccess(false);
    try {
      const image = file ? await toBase64(file) : null;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-visitor-place`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") || "").trim(),
          main_category: String(form.get("main_category") || "").trim(),
          sub_category: String(form.get("sub_category") || "").trim() || null,
          description: String(form.get("description") || "").trim() || null,
          address: String(form.get("address") || "").trim() || null,
          municipality: String(form.get("municipality") || "").trim() || null,
          phone: String(form.get("phone") || "").trim() || null,
          latitude: Number(form.get("latitude")) || null,
          longitude: Number(form.get("longitude")) || null,
          map_link: String(form.get("map_link") || "").trim() || null,
          image_base64: image,
          image_file_name: file?.name || null,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || body.error || "تعذر إرسال الاقتراح");
      event.currentTarget.reset();
      setMapLink("");
      setCoordinates({ latitude: "", longitude: "" });
      setCoordinatesDetected(false);
      setSuccess(true);
      setNotice("تم استلام المعلم وسيظهر بعد مراجعته وقبوله من الإدارة.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "تعذر إرسال الاقتراح حالياً.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="platform-suggest-form" onSubmit={submit}>
      <section className="suggest-place-identity">
        <div className="platform-form-section-heading"><span>01</span><div><h2>تعريف المكان</h2><p>الاسم والتصنيف والموقع الأساسي.</p></div><b>البيانات الأساسية</b></div>
        <p className="suggest-place-identity__hint">اكتب المعلومات كما يعرفها السكان والزوار. الحقول المعلّمة بـ <strong>*</strong> مطلوبة لإرسال الاقتراح.</p>
        <div className="platform-form-grid">
          <label><span className="suggest-field-label">اسم المعلم <em>* مطلوب</em></span><input name="name" required minLength={2} placeholder="مثال: واحة أو سوق أو قصر" /></label>
          <label><span className="suggest-field-label">التصنيف الرئيسي <em>* مطلوب</em></span><input name="main_category" required placeholder="معلم تراثي، سوق، طبيعة..." /></label>
          <label><span className="suggest-field-label">التصنيف الفرعي <small>اختياري</small></span><input name="sub_category" placeholder="مثال: قصر تاريخي أو واحة" /></label>
          <label><span className="suggest-field-label">البلدية <small>اختياري</small></span><input name="municipality" placeholder="بلدية الوادي" /></label>
          <label><span className="suggest-field-label">العنوان <small>اختياري</small></span><input name="address" placeholder="الحي أو الشارع" /></label>
          <label><span className="suggest-field-label">الهاتف <small>اختياري</small></span><input name="phone" type="tel" placeholder="05 XX XX XX XX" dir="ltr" /></label>
        </div>
      </section>

      <div className="platform-form-section-heading"><span>02</span><div><h2>المعلومات المفيدة</h2><p>أضف وصفاً يساعد الزائر على فهم المكان.</p></div></div>
      <label className="platform-form-wide">الوصف<textarea name="description" rows={5} placeholder="ما الذي يميز المكان؟ وما قصته؟" /></label>

      <div className="suggest-coordinates-box">
        <div className="suggest-coordinates-box__heading"><div><MapPin size={18} /><strong>موقع المعلم</strong><span>أضف رابط المكان من Google Maps لتحديده بدقة.</span></div><span className="suggest-coordinates-box__badge">يسهّل المراجعة</span></div>
        <label className="platform-form-wide suggest-map-link-field">رابط Google Maps<input name="map_link" type="url" value={mapLink} onChange={(event) => handleMapLinkChange(event.target.value)} placeholder="https://maps.google.com/..." dir="ltr" inputMode="url" /></label>
        <div className="suggest-map-link-actions"><span><Link2 size={14} /> الصق رابط المشاركة من تطبيق خرائط Google</span>{mapLink && <button type="button" onClick={() => window.open(mapLink, "_blank", "noopener,noreferrer")}><ExternalLink size={14} /> فتح الرابط</button>}</div>
        {coordinatesDetected && <p className="suggest-coordinates-detected"><CheckCircle2 size={15} /> تم استخراج الإحداثيات تلقائياً من الرابط، ويمكنك تعديلها عند الحاجة.</p>}
        <div className="platform-form-grid suggest-coordinate-grid"><label>خط العرض<input name="latitude" type="number" step="any" value={coordinates.latitude} onChange={(event) => { setCoordinates((current) => ({ ...current, latitude: event.target.value })); setCoordinatesDetected(false); }} placeholder="33.36" /></label><label>خط الطول<input name="longitude" type="number" step="any" value={coordinates.longitude} onChange={(event) => { setCoordinates((current) => ({ ...current, longitude: event.target.value })); setCoordinatesDetected(false); }} placeholder="6.86" /></label></div>
      </div>

      <div className="platform-form-section-heading"><span>03</span><div><h2>صورة المكان</h2><p>صورة واضحة اختيارية لبداية المراجعة.</p></div></div>
      <label className="platform-suggest-upload"><Camera size={22} /><span><strong>اختر صورة JPG أو PNG أو WebP</strong><small>حتى 8 ميغابايت · اختيارية</small></span><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" /></label>
      {notice && <p className={`platform-form-notice${success ? " is-success" : ""}`}>{success && <CheckCircle2 size={16} />}{notice}</p>}
      <button type="submit" className="platform-button platform-button--amber" disabled={sending}>{sending ? <LoaderCircle className="platform-spin" size={17} /> : <Send size={17} />}{sending ? "جارٍ إرسال الاقتراح..." : "إرسال للمراجعة"}</button>
    </form>
  );
}
