"use client";

// Ouedna platform header: language and direction are driven by the shared provider.
import { ArrowRight, Compass, Globe2, History, Home, MapPinned, MessageCircle, Route, View } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type DictKey, useLanguage } from "@/lib/i18n";
import PwaInstallButton from "./PwaInstallButton";

type NavItem = readonly [href: string, labelKey: DictKey, icon: typeof Compass];

export default function PlatformHeader({ active }: { active?: string }) {
  const { lang, setLang, t } = useLanguage();
  const showBack = Boolean(active && active !== "/");
  const items: NavItem[] = [
    ["/", "home", Home],
    ["/explore", "explore", Compass],
    ["/map", "map", MapPinned],
    ["/itinerary", "itinerary", Route],
    ["/archive", "archive", History],
    ["/community", "community", MessageCircle],
    ["/virtual-tour", "vrTour", View],
  ];
  const mobileItems: NavItem[] = items.filter(([href]) => ["/", "/explore", "/map", "/itinerary", "/community"].includes(href));

  return (
    <>
      <header className="platform-header">
        <div className="platform-header__inner">
          {showBack && <button type="button" className="platform-back-button" onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = "/"; }} aria-label={t("back")}><ArrowRight size={18} /></button>}
          <Link href="/" className="platform-brand">
            <span className="platform-brand__mark"><Image src="/ouedna/ouedna-mark-new.png" alt="" width={31} height={31} /></span>
            <span><strong>وادنا</strong><small>المنصة الرقمية للسياحة بالوادي</small></span>
          </Link>
          <nav className="platform-nav" aria-label={t("primaryNavigation")}>
            {items.map(([href, labelKey, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""} aria-current={active === href ? "page" : undefined}><Icon size={16} />{t(labelKey)}</Link>)}
          </nav>
          <div className="platform-header__actions">
            <label className="platform-language" aria-label={t("language")}>
              <Globe2 size={15} />
              <select value={lang} onChange={(event) => setLang(event.target.value as typeof lang)}>
                <option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option>
              </select>
            </label>
            <PwaInstallButton />
          </div>
        </div>
      </header>
      <nav className="platform-mobile-nav" aria-label={t("primaryNavigation")}>
        {mobileItems.map(([href, labelKey, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""} aria-current={active === href ? "page" : undefined}><Icon size={19} /><span>{t(labelKey)}</span></Link>)}
      </nav>
    </>
  );
}
