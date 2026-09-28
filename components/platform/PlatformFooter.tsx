import { Compass, Heart, MapPinned, MessageCircle, ShieldCheck, View } from "lucide-react";
import Link from "next/link";

const links = [
  ["/explore", "استكشف", Compass],
  ["/map", "الخريطة", MapPinned],
  ["/community", "المجتمع", MessageCircle],
  ["/virtual-tour", "زيارة افتراضية VR", View],
  ["/favorites", "المفضلة", Heart],
] as const;

export default function PlatformFooter() {
  return (
    <footer className="platform-footer" aria-label="تذييل الموقع">
      <div className="platform-footer__main">
        <div className="platform-footer__identity">
          <Link href="/" className="platform-footer__brand">وادنا</Link>
          <p>المنصة السياحية الرسمية لاكتشاف ولاية الوادي ووادي سوف.</p>
          <span><ShieldCheck size={14} /> محتوى محلي موثوق ومراجع</span>
        </div>
        <nav className="platform-footer__links" aria-label="روابط الموقع">
          {links.map(([href, label, Icon]) => <Link href={href} key={href}><Icon size={15} />{label}</Link>)}
          <Link href="/privacy">الخصوصية</Link>
          <a href="mailto:hello@ouedna.dz">تواصل معنا</a>
        </nav>
      </div>
      <div className="platform-footer__bottom"><small>Ouedna · Wadi Souf</small><small>© {new Date().getFullYear()} وادنا. جميع الحقوق محفوظة.</small></div>
    </footer>
  );
}
