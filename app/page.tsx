import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ArrowUpLeft,
  Check,
  Compass,
  Download,
  Hotel,
  MapPinned,
  Navigation,
  QrCode,
  Store,
  Utensils,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { decodeImageUrls } from "@/services/places";

type HomePlace = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  municipality: string | null;
  image: string;
  rating: number;
};

async function getHomePlaces(): Promise<HomePlace[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase
    .from("places")
    .select("id,name,description,category,main_category,municipality,image_url,rating")
    .eq("status", "منشور")
    .order("id", { ascending: false })
    .limit(6);

  return (data || [])
    .map((place) => ({
      id: place.id,
      name: place.name,
      description: place.description,
      category: place.category || place.main_category,
      municipality: place.municipality,
      image: decodeImageUrls(place.image_url)[0] || "/ouedna/local-architecture.webp",
      rating: Number(place.rating || 0),
    }))
    .filter((place) => place.name);
}

const partnerTypes = [
  ["الوكالات السياحية", Compass],
  ["الفنادق", Hotel],
  ["المطاعم", Utensils],
  ["النقل السياحي", Navigation],
  ["المرشدون السياحيون", UsersRound],
  ["الحرفيون والثقافة", Store],
] as const;

const benefits = [
  "صفحة احترافية لنشاطك",
  "ظهور على الخريطة",
  "الوصول إلى مستخدمي تطبيق وادنا",
  "عرض الخدمات والرحلات والعروض",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const places = await getHomePlaces();
  const categoryCount = new Set(places.map((place) => place.category).filter(Boolean)).size;

  return (
    <PlatformFrame active="/">
      <main className="home-premium">
        <section className="home-premium__hero">
          <Image src="/ouedna/hero-oasis.jpg" alt="واحة وادي سوف بين الكثبان والنخيل" fill priority sizes="100vw" className="home-premium__hero-image" />
          <div className="home-premium__hero-overlay" />
          <div className="home-premium__hero-orbit" />
          <div className="home-premium__hero-content">
            <span className="home-premium__eyebrow"><i /> المنصة الرقمية للسياحة في وادي سوف</span>
            <h1>وادنا <b>Ouedna</b></h1>
            <p className="home-premium__hero-title">اكتشف الوجهة، خطط رحلتك، وتواصل مع المؤسسات السياحية المحلية من مكان واحد.</p>
            <div className="home-premium__actions">
              <Link href="/suggest-place" className="home-premium__button home-premium__button--gold">سجّل نشاطك السياحي <ArrowLeft size={17} /></Link>
              <Link href="/explore" className="home-premium__button home-premium__button--glass">استكشف وادنا <Compass size={17} /></Link>
            </div>
            <div className="home-premium__hero-proof"><span><Check size={14} /> الموقع</span><span><Check size={14} /> الخريطة</span><span><Check size={14} /> التطبيق</span><small>في منصة واحدة</small></div>
          </div>
          <div className="home-premium__hero-caption"><span>WADI SOUF</span><strong>مدينة الألف<br />قبة وقبة</strong></div>
        </section>

        <section className="home-premium__intro home-premium__container">
          <div className="home-premium__section-index">01 <span>لماذا وادنا؟</span></div>
          <div><span className="home-premium__label">من وادي سوف إلى العالم</span><h2>وجهة واحدة.<br /><em>تجارب لا تُنسى.</em></h2></div>
          <p>وادنا يربط الزائر بالمكان وأهله: معالم موثوقة، مؤسسات سياحية ظاهرة، وخريطة تساعدك على الانتقال من الإلهام إلى الرحلة.</p>
        </section>

        <section className="home-premium__business home-premium__container">
          <div className="home-premium__business-copy"><span className="home-premium__label home-premium__label--gold">للشركاء المحليين</span><h2>هل تملك وكالة<br /><em>أو نشاطًا سياحيًا؟</em></h2><p>اجعل نشاطك جزءًا من الخريطة السياحية الرقمية لولاية الوادي، واسمح للزوار باكتشاف خدماتك وموقعك والتواصل معك.</p><Link href="/suggest-place" className="home-premium__text-link">أضف نشاطك الآن <ArrowLeft size={16} /></Link></div>
          <div className="home-premium__benefits">{benefits.map((benefit, index) => <article key={benefit}><span>0{index + 1}</span><Check size={18} /><strong>{benefit}</strong></article>)}</div>
        </section>

        <section className="home-premium__map home-premium__container">
          <div className="home-premium__map-copy"><span className="home-premium__label">استكشف بوضوح</span><h2>المكان يبدأ<br /><em>من الخريطة.</em></h2><p>خريطة تفاعلية متصلة بالمعالم المنشورة فعليًا في وادي سوف، لتجد ما تبحث عنه وتصل إليه بسهولة.</p><div className="home-premium__map-stats"><strong>{places.length || "—"}<small>أماكن منشورة</small></strong><strong>{categoryCount || "—"}<small>فئات سياحية</small></strong></div><Link href="/map" className="home-premium__button home-premium__button--green">افتح الخريطة <MapPinned size={17} /></Link></div>
          <div className="home-premium__map-card"><div className="home-premium__map-grid" /><div className="home-premium__map-road home-premium__map-road--one" /><div className="home-premium__map-road home-premium__map-road--two" /><div className="home-premium__map-pin home-premium__map-pin--one"><MapPinIcon /><b>وادي سوف</b></div><div className="home-premium__map-pin home-premium__map-pin--two"><MapPinIcon /><b>وجهة قريبة</b></div><div className="home-premium__map-legend"><span><i className="tourist" />معالم سياحية</span><span><i className="business" />مؤسسات سياحية</span><span><i className="heritage" />تراث وثقافة</span></div></div>
        </section>

        <section className="home-premium__places">
          <div className="home-premium__container"><div className="home-premium__section-heading"><div><span className="home-premium__label">بيانات حقيقية من وادنا</span><h2>أماكن وخدمات<br /><em>تستحق الاكتشاف.</em></h2></div><Link href="/explore" className="home-premium__text-link">عرض كل المعالم <ArrowLeft size={16} /></Link></div>
          {places.length ? <div className="home-premium__place-grid">{places.slice(0, 3).map((place, index) => <Link href={`/place/${place.id}`} className={`home-premium__place home-premium__place--${index + 1}`} key={place.id}><div className="home-premium__place-image"><Image src={place.image} alt={place.name} fill sizes="(max-width: 700px) 100vw, 33vw" /><span>{place.category || "وجهة سياحية"}</span></div><div className="home-premium__place-body"><small>0{index + 1} · {place.municipality || "ولاية الوادي"}</small><h3>{place.name}</h3><ArrowUpLeft size={18} /></div></Link>)}</div> : <div className="home-premium__empty">جاري تحميل الأماكن المنشورة من المنصة…</div>}
          </div>
        </section>

        <section className="home-premium__app home-premium__container"><div className="home-premium__phone"><div className="home-premium__phone-screen"><Image src="/ouedna/palm-oasis.jpg" alt="تطبيق وادنا" fill sizes="280px" /><div><span>وادنا</span><strong>اكتشف الأقرب إليك</strong><small>خريطة + رحلة + ذاكرة</small></div></div></div><div className="home-premium__app-copy"><span className="home-premium__label home-premium__label--gold">وادنا في هاتفك</span><h2>اكتشف على الويب<br /><em>تابع رحلتك من التطبيق.</em></h2><p>خذ الخريطة، المسارات، والوجهات معك أينما ذهبت. حمّل النسخة الرسمية الحالية من Ouedna.</p><Link href="/download" className="home-premium__button home-premium__button--gold"><Download size={17} /> تنزيل التطبيق</Link></div></section>

        <section className="home-premium__partners home-premium__container"><div><span className="home-premium__label">شبكة وادنا</span><h2>كن شريكًا في<br /><em>الوجهة السياحية الرقمية.</em></h2><p>من يقدّم تجربة محلية، يصنع صورة وادي سوف. انضم إلى المنصة التي تجمع الزائر بكل ما يحتاجه.</p><Link href="/suggest-place" className="home-premium__text-link">انضم إلى شبكة وادنا <ArrowLeft size={16} /></Link></div><div className="home-premium__partner-grid">{partnerTypes.map(([label, Icon]) => <div key={label}><Icon size={19} /><span>{label}</span></div>)}</div></section>

        <section className="home-premium__qr home-premium__container"><div><span className="home-premium__label home-premium__label--gold">ابدأ من هنا</span><h2>امسح الكود<br /><em>وجرّب وادنا الآن.</em></h2><p>افتح الموقع على هاتفك أو نزّل التطبيق الرسمي لتبدأ الاستكشاف.</p></div><div className="home-premium__qr-card"><Image src="/ouedna/ouedna-apk-qr.png" alt="رمز QR لتنزيل تطبيق وادنا" width={170} height={170} /><span><QrCode size={16} /> الموقع والتطبيق في متناولك</span></div></section>
        <div className="home-premium__mobile-cta"><Link href="/suggest-place">سجّل نشاطك <ArrowLeft size={16} /></Link></div>
      </main>
    </PlatformFrame>
  );
}

function MapPinIcon() { return <span className="home-premium__pin-dot"><MapPinIconInner /></span>; }
function MapPinIconInner() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" fill="currentColor" /><circle cx="12" cy="10" r="2.5" fill="#e7bd69" /></svg>; }
