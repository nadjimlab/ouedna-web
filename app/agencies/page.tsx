import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MapPin, Megaphone } from "lucide-react";
import PlatformFrame from "@/components/platform/PlatformFrame";
import ContactActions from "@/components/business/ContactActions";
import { createPublicClient } from "@/lib/supabase/public";
import { siteConfig } from "@/app/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وكالات السياحة والرحلات في وادي سوف | وادنا",
  description: "دليل وكالات السياحة والرحلات الصحراوية والإقامات في ولاية الوادي: اتصل مباشرة أو راسلهم عبر واتساب.",
  alternates: { canonical: `${siteConfig.url}/agencies` },
};

type Agency = {
  id: string | number; name: string; description?: string | null; municipality?: string | null; address?: string | null;
  phone?: string | null; whatsapp?: string | null; website?: string | null; map_link?: string | null; image_url?: string | null; is_featured?: boolean | null;
};

async function getAgencies(): Promise<Agency[]> {
  try {
    const supabase = createPublicClient(300);
    const { data, error } = await supabase.from("tourism_agencies").select("*").eq("status", "active").limit(200);
    if (error || !data) return [];
    return (data as Agency[]).sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
  } catch {
    return [];
  }
}

export default async function AgenciesPage() {
  const agencies = await getAgencies();
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: agencies.map((a, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TravelAgency", name: a.name, telephone: a.phone || undefined, url: a.website || undefined, address: { "@type": "PostalAddress", addressLocality: a.municipality || "ولاية الوادي", addressCountry: "DZ" } } })),
  };
  return (
    <PlatformFrame active="/agencies">
      <section className="platform-container py-10" dir="rtl">
        {agencies.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />}
        <div className="platform-section-heading">
          <span className="platform-eyebrow"><i />شركاء وادنا</span>
          <h1>وكالات السياحة والرحلات في وادي سوف</h1>
          <p>تواصل مباشرة مع وكالات محلية لتنظيم رحلاتك الصحراوية وإقامتك وجولاتك.</p>
        </div>

        {agencies.length === 0 ? (
          <div className="platform-empty-panel">
            <Megaphone size={28} />
            <h2>قائمة الشركاء قيد الإعداد</h2>
            <p>هل تدير وكالة أو نزلاً أو مطعماً في الوادي؟ كن أول من يظهر هنا.</p>
            <Link className="platform-button platform-button--green" href="/advertise">اعرف كيف تنضم</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <article key={agency.id} className="platform-place-card" style={{ padding: 0 }}>
                {agency.image_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={agency.image_url} alt={agency.name} loading="lazy" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: "inherit" }} /> : null}
                <div className="platform-place-card__body" style={{ display: "grid", gap: 10 }}>
                  <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>{agency.name}{agency.is_featured && <BadgeCheck size={16} aria-label="شريك مميز" />}</strong>
                  {(agency.municipality || agency.address) && <small style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} />{agency.municipality || agency.address}</small>}
                  {agency.description && <p style={{ lineHeight: 1.8 }}>{agency.description}</p>}
                  <ContactActions compact target={{ type: "agency", id: agency.id }} name={agency.name} phone={agency.phone} whatsapp={agency.whatsapp} website={agency.website} mapLink={agency.map_link} />
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="mt-10 text-center"><Link className="platform-text-link" href="/advertise">هل تملك نشاطاً سياحياً؟ أضفه إلى وادنا ←</Link></p>
      </section>
    </PlatformFrame>
  );
}
