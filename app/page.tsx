import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, ArrowUpLeft, CalendarDays, Compass, Download, Heart, MapPinned, Navigation, Plus, Sparkles, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PlatformFrame from "@/components/platform/PlatformFrame";
import HeroSection from "@/components/HeroSection";
import PwaInstallButton from "@/components/platform/PwaInstallButton";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

type HomePlace = { id: number; name: string; description: string | null; category: string | null; municipality: string | null; image: string; rating: number };

function getFirstImage(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || "");
  if (typeof value === "string") return value.replace(/[\[\]"']/g, "").split(",")[0]?.trim() || "";
  return "";
}

async function getHomePlaces(): Promise<HomePlace[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase.from("places").select("*").eq("status", "منشور").order("id", { ascending: false }).limit(6);
  return (data || []).map((place) => ({ id: place.id, name: place.name, description: place.description, category: place.category || place.main_category, municipality: place.municipality, image: getFirstImage(place.image_url) || "/ouedna/local-architecture.webp", rating: Number(place.rating || 0) })).filter((place) => place.name);
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const places = await getHomePlaces();
  return (
    <PlatformFrame active="/">
      <main className="radical-home">
        <HeroSection />

        <section className="radical-intro radical-wrap">
          <div className="radical-intro__index">02 <span>عن وادنا</span></div>
          <div className="radical-intro__statement"><span className="radical-label">رحلة تبدأ من هنا</span><h2>كل زاوية في سوف<br /><em>لها حكاية.</em></h2></div>
          <div className="radical-intro__copy"><p>من أول خطوة على الرمل إلى آخر ضوء فوق النخيل، نرتب لك تجربة محلية حقيقية: أماكن موثوقة، مسارات واضحة، وذاكرة يحفظها أهل الوادي.</p><Link href="/about" className="radical-arrow-link">تعرف على وادنا <ArrowLeft size={15} /></Link></div>
        </section>

        <section className="radical-tools radical-wrap">
          <div className="radical-section-head"><div><span className="radical-label">أدوات الرحلة</span><h2>خطّطها.<br /><em>عشها.</em></h2></div><p>كل ما تحتاجه لتنتقل من الفضول إلى الطريق في أقل من ثلاث خطوات.</p></div>
          <div className="radical-tool-grid">
            <Link href="/explore" className="radical-tool radical-tool--dark"><span className="radical-tool__number">01</span><Compass size={25} /><h3>اكتشف المعالم</h3><p>أماكن منشورة وصور حقيقية من ولاية الوادي.</p><ArrowUpLeft className="radical-tool__arrow" size={22} /></Link>
            <Link href="/map" className="radical-tool radical-tool--image"><Image src="/ouedna/palm-oasis.jpg" alt="خريطة واحة وادي سوف" fill sizes="(max-width: 800px) 100vw, 33vw" /><span className="radical-tool__shade" /><span className="radical-tool__number">02</span><MapPinned size={25} /><h3>افتح الطريق</h3><p>خريطة تفاعلية ومسارات تبدأ من موقعك.</p><ArrowUpLeft className="radical-tool__arrow" size={22} /></Link>
            <Link href="/itinerary" className="radical-tool radical-tool--sand"><span className="radical-tool__number">03</span><CalendarDays size={25} /><h3>ابنِ يومك</h3><p>برنامج سريع أو يوم كامل حسب وقتك واهتماماتك.</p><ArrowUpLeft className="radical-tool__arrow" size={22} /></Link>
          </div>
        </section>

        <section className="radical-places radical-wrap">
          <div className="radical-section-head radical-section-head--places"><div><span className="radical-label">اختيارات وادنا</span><h2>أماكن تستحق<br /><em>التوقف.</em></h2></div><Link href="/explore" className="radical-arrow-link">كل المعالم <ArrowLeft size={15} /></Link></div>
          {places.length ? <div className="radical-place-grid">{places.slice(0, 3).map((place, index) => <article className={`radical-place-card radical-place-card--${index + 1}`} key={place.id}><Link href={`/place/${place.id}`} className="radical-place-card__media"><Image src={place.image} alt={place.name} fill sizes="(max-width: 800px) 100vw, 33vw" /><span>{place.category || "معلم سياحي"}</span></Link><div className="radical-place-card__body"><span>0{index + 1}</span><div><h3>{place.name}</h3><p>{place.municipality || "ولاية الوادي"} · <Star size={12} fill="currentColor" /> {place.rating ? place.rating.toFixed(1) : "جديد"}</p></div><Link href={`/place/${place.id}`} aria-label={`تفاصيل ${place.name}`}><ArrowLeft size={17} /></Link></div></article>)}</div> : <div className="radical-empty">المعالم قيد التحميل…</div>}
        </section>

        <section className="radical-cta radical-wrap"><div className="radical-cta__inner"><div><span className="radical-label">خذ وادنا معك</span><h2>رحلتك القادمة<br /><em>تبدأ الآن.</em></h2><p>حمّل التطبيق الرسمي أو ثبّت وادنا على هاتفك لتبقى الخريطة والقصص معك أينما ذهبت.</p><div className="radical-cta__actions"><Link className="radical-button radical-button--gold" href="/download"><Download size={17} /> تنزيل التطبيق</Link><PwaInstallButton compact={false} /></div></div><div className="radical-cta__mark"><Image src="/ouedna/ouedna-mark-new.png" alt="شعار وادنا" width={210} height={210} /><span>Ouedna<br /><b>Wadi Souf</b></span></div></div></section>

        <section className="radical-footer-links radical-wrap"><Link href="/archive"><Sparkles size={18} /><span>ذاكرة الوادي</span><ArrowLeft size={15} /></Link><Link href="/community"><Users size={18} /><span>صوت الزوار</span><ArrowLeft size={15} /></Link><Link href="/suggest-place"><Plus size={18} /><span>أضف معلماً</span><ArrowLeft size={15} /></Link><Link href="/favorites"><Heart size={18} /><span>مفضلتي</span><ArrowLeft size={15} /></Link></section>
      </main>
    </PlatformFrame>
  );
}
