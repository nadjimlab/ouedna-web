import { ArrowLeft, ArrowRight, Check, Compass, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import PlatformFrame from "@/components/platform/PlatformFrame";
import SuggestPlaceClient from "./SuggestPlaceClient";
import type { Metadata } from "next";
import { siteConfig } from "@/app/metadata";

export const metadata: Metadata = {
  title: "اقترح معلماً في وادي سوف | وادنا",
  description: "ساهم في توثيق معلم حقيقي في وادي سوف ليُراجع قبل إضافته إلى دليل وادنا.",
  alternates: { canonical: `${siteConfig.url}/suggest-place` },
  robots: { index: false, follow: true },
};

const reviewSteps = [
  { number: "01", title: "أرسل التفاصيل", text: "أخبرنا باسم المكان وموقعه وما يجعله مميزاً." },
  { number: "02", title: "نراجع المعلومات", text: "يتحقق فريق وادنا من البيانات والصورة قبل النشر." },
  { number: "03", title: "يظهر للجميع", text: "ينضم المعلم إلى الدليل ليستفيد منه الزوار." },
];

export default function SuggestPlacePage() {
  return (
    <PlatformFrame active="/community">
      <main className="platform-page platform-suggest-page suggest-page-v2">
        <div className="platform-container">
          <Link className="platform-back-link" href="/explore">
            <ArrowRight size={16} /> العودة إلى الاستكشاف
          </Link>

          <section className="suggest-hero-v2">
            <div className="suggest-hero-v2__copy">
              <span className="platform-eyebrow"><i /> أنت جزء من قصة المكان</span>
              <h1>هل تعرف معلماً<br /><em>يستحق أن يُروى؟</em></h1>
              <p>كل واحة، سوق، قصر، ومقهى يحمل حكاية. ساعدنا على توثيق الأماكن التي تحبها وإيصالها إلى المسافرين الباحثين عن تجربة أصيلة.</p>
              <div className="suggest-hero-v2__actions">
                <a href="#suggest-form" className="platform-button platform-button--amber"><Sparkles size={17} /> ابدأ الإضافة <ArrowLeft size={15} /></a>
                <Link href="/explore" className="platform-button platform-button--outline"><Compass size={17} /> تصفح الدليل</Link>
              </div>
              <div className="suggest-hero-v2__trust">
                <span><ShieldCheck size={15} /> مراجعة قبل النشر</span>
                <span><Users size={15} /> دليل يبنيه أهل المكان</span>
              </div>
            </div>
            <div className="suggest-hero-v2__visual" aria-label="ساهم في توثيق معالم وادي سوف">
              <div className="suggest-hero-v2__image" />
              <div className="suggest-hero-v2__visual-card">
                <MapPin size={18} />
                <div><strong>معلومة محلية</strong><span>قد تصنع طريقاً جديداً</span></div>
              </div>
              <div className="suggest-hero-v2__orbit"><span /><span /><span /></div>
            </div>
          </section>

          <section className="suggest-steps" aria-label="طريقة إضافة معلم">
            {reviewSteps.map((step) => (
              <div className="suggest-step" key={step.number}>
                <span className="suggest-step__number">{step.number}</span>
                <div><h2>{step.title}</h2><p>{step.text}</p></div>
                <Check size={17} />
              </div>
            ))}
          </section>

          <section className="suggest-form-layout" id="suggest-form">
            <div className="suggest-form-column">
              <div className="suggest-section-heading"><span className="platform-eyebrow"><i /> نموذج الإضافة</span><h2>أضف المكان<br /><em>بكل بساطة.</em></h2><p>المعلومات الأساسية تكفي للبدء. يمكنك إضافة الموقع والصورة لمساعدة فريقنا على التحقق بسرعة.</p></div>
              <SuggestPlaceClient />
            </div>
            <aside className="suggest-aside">
              <div className="suggest-aside__head"><span>دليل سريع</span><Sparkles size={18} /></div>
              <h2>اجعل اقتراحك<br /><em>أكثر فائدة.</em></h2>
              <ul>
                <li><span>01</span><div><strong>اختر اسماً واضحاً</strong><p>استخدم الاسم الذي يعرفه به السكان والزوار.</p></div></li>
                <li><span>02</span><div><strong>اكتب ما يميزه</strong><p>قصة قصيرة أو معلومة عملية تجعل الزيارة أسهل.</p></div></li>
                <li><span>03</span><div><strong>أرفق صورة حقيقية</strong><p>صورة واحدة واضحة تساعد على اعتماد الاقتراح.</p></div></li>
              </ul>
              <div className="suggest-aside__quote"><span>“</span><p>المكان الذي تعرفه اليوم قد يصبح وجهة شخص غداً.</p></div>
            </aside>
          </section>
        </div>
      </main>
    </PlatformFrame>
  );
}
