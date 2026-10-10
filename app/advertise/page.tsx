import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, BarChart3, Check, MessageCircle, Star } from "lucide-react";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { whatsappNumber } from "@/lib/contact";
import { siteConfig } from "@/app/metadata";

export const metadata: Metadata = {
  title: "أعلن معنا | وادنا — اجلب سياحاً إلى نشاطك في وادي سوف",
  description: "قوائم مميزة للفنادق والوكالات والمطاعم في وادي سوف مع أزرار اتصال وواتساب وتقارير شهرية بعدد النقرات الحقيقية.",
  alternates: { canonical: `${siteConfig.url}/advertise` },
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@ouedna.dz";
const CONTACT_WHATSAPP = whatsappNumber(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP);

const tiers = [
  { name: "أساسي", tag: "مجاني", icon: Check, items: ["صفحة للنشاط في الدليل", "الموقع على الخريطة", "ساعات العمل والعنوان"] },
  { name: "موثّق", tag: "اشتراك", icon: BadgeCheck, featured: false, items: ["كل مزايا الأساسي", "أزرار اتصال وواتساب واتجاهات", "شارة «موثّق» بعد التحقق", "حتى 10 صور"] },
  { name: "مميّز", tag: "اشتراك", icon: Star, featured: true, items: ["كل مزايا الموثّق", "ظهور في أعلى نتائج الاستكشاف وصفحة الشركاء", "إدراج في الصفحة الرئيسية", "تقرير شهري بعدد الاتصالات والنقرات"] },
];

export default function AdvertisePage() {
  const subject = encodeURIComponent("الانضمام إلى وادنا");
  return (
    <PlatformFrame active="/advertise">
      <section className="platform-container py-10" dir="rtl">
        <div className="platform-section-heading">
          <span className="platform-eyebrow"><i />للأعمال المحلية</span>
          <h1>اجعل السياح يجدونك ويتصلون بك مباشرة</h1>
          <p>وادنا يعرّف الزوار بمعالم وادي سوف وخدماته. أضف فندقك أو وكالتك أو مطعمك، وسنريك شهرياً كم شخصاً اتصل أو راسلك أو طلب الاتجاهات.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {tiers.map(({ name, tag, icon: Icon, items, featured }) => (
            <article key={name} className="platform-place-card" style={{ padding: 22, borderColor: featured ? "currentColor" : undefined }}>
              <Icon size={22} />
              <h2 style={{ margin: "8px 0 2px" }}>{name}</h2>
              <small>{tag} — السعر حسب الباقة، تواصل معنا</small>
              <ul style={{ marginTop: 14, display: "grid", gap: 8, lineHeight: 1.7 }}>
                {items.map((item) => <li key={item} style={{ display: "flex", gap: 8 }}><Check size={16} style={{ flexShrink: 0, marginTop: 5 }} />{item}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <div className="place-detail-note" style={{ marginTop: 28 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={18} /> نتائج تراها بنفسك</strong>
          <p>كل ضغطة على «اتصال» أو «واتساب» أو «الاتجاهات» في صفحتك تُحتسب، فتعرف قيمة ظهورك على وادنا بالأرقام لا بالتخمين.</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {CONTACT_WHATSAPP && <a className="platform-button platform-button--green" href={`https://wa.me/${CONTACT_WHATSAPP}?text=${subject}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> راسلنا على واتساب</a>}
          <a className="platform-button platform-button--outline" href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}>{CONTACT_EMAIL}</a>
          <Link className="platform-button platform-button--outline" href="/agencies">شاهد صفحة الشركاء</Link>
        </div>
      </section>
    </PlatformFrame>
  );
}
