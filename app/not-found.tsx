import Link from "next/link";
import { ArrowLeft, Compass, MapPinned, Route } from "lucide-react";
import PlatformFrame from "@/components/platform/PlatformFrame";
import { LanguageProvider } from "@/lib/i18n";

const quickLinks = [
  ["/explore", "استكشف المعالم"],
  ["/map", "الخريطة التفاعلية"],
  ["/itinerary", "خطط رحلتك"],
  ["/archive", "ذاكرة الوادي"],
] as const;

export default function NotFound() {
  return (
    <LanguageProvider>
      <PlatformFrame>
      <section className="platform-not-found" aria-labelledby="not-found-title">
        <div className="platform-not-found__inner">
          <div className="platform-not-found__mark" aria-hidden="true">⌁</div>
          <span className="platform-not-found__code">404 · OUEDNA</span>
          <h1 id="not-found-title">هذه الصفحة لم تعد على الخريطة</h1>
          <p>يبدو أن الرابط تغيّر أو أن المكان الذي تبحث عنه غير متاح حالياً. ابدأ من إحدى الوجهات الأساسية واكتشف وادي سوف من جديد.</p>
          <div className="platform-not-found__actions">
            <Link href="/" className="platform-button platform-button--green"><ArrowLeft size={17} /> العودة للرئيسية</Link>
            <Link href="/explore" className="platform-button platform-button--outline"><Compass size={17} /> ابدأ الاستكشاف</Link>
          </div>
          <nav className="platform-not-found__links" aria-label="مسارات سريعة">
            <Link href="/map"><MapPinned size={14} /> الخريطة</Link>
            <Link href="/itinerary"><Route size={14} /> خط الرحلة</Link>
            {quickLinks.slice(3).map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>
        </div>
      </section>
      </PlatformFrame>
    </LanguageProvider>
  );
}
