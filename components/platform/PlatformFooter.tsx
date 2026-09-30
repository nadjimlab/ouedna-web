"use client";

import { Compass, Heart, MapPinned, MessageCircle, ShieldCheck, View } from "lucide-react";
import Link from "next/link";
import { useLanguage, type DictKey } from "@/lib/i18n";

const links: readonly [string, DictKey, typeof Compass][] = [
  ["/explore", "explore", Compass],
  ["/map", "map", MapPinned],
  ["/community", "community", MessageCircle],
  ["/virtual-tour", "homeFeatVr", View],
  ["/favorites", "favorites", Heart],
];

export default function PlatformFooter() {
  const { t } = useLanguage();
  return (
    <footer className="platform-footer" aria-label={t("footerNavigation")}>
      <div className="platform-footer__main">
        <div className="platform-footer__identity">
          <Link href="/" className="platform-footer__brand">وادنا</Link>
          <p>{t("footerDesc")}</p>
          <span><ShieldCheck size={14} /> {t("footerTrusted")}</span>
        </div>
        <nav className="platform-footer__links" aria-label={t("footerNavigation")}>
          {links.map(([href, labelKey, Icon]) => <Link href={href} key={href}><Icon size={15} />{t(labelKey)}</Link>)}
          <Link href="/privacy">{t("privacy")}</Link>
          <a href="mailto:hello@ouedna.dz">{t("contactUs")}</a>
        </nav>
      </div>
      <div className="platform-footer__bottom"><small>Ouedna · Wadi Souf</small><small>© {new Date().getFullYear()} وادنا. {t("allRightsReserved")}</small></div>
    </footer>
  );
}
