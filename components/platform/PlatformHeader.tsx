"use client";

// Ouedna platform header: language and direction are driven by the shared provider.
<<<<<<< HEAD
import { ArrowRight, Compass, Download, Globe2, History, Home, MapPinned, MessageCircle, View } from "lucide-react";
=======
import { Compass, Download, Globe2, History, Home, MapPinned, MessageCircle, View } from "lucide-react";
>>>>>>> 1813fdc (feat: add immersive virtual tour and hide health facilities)
import Link from "next/link";
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
    ["/archive", "archive", History],
    ["/community", "community", MessageCircle],
    ["/virtual-tour", "vrTour", View],
  ];
  const mobileItems: NavItem[] = items.filter(([href]) => href !== "/virtual-tour");

  return (
    <>
      <header className="platform-header">
        <div className="platform-header__inner">
          {showBack && <button type="button" className="platform-back-button" onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = "/"; }} aria-label="العودة"><ArrowRight size={18} /></button>}
          <Link href="/" className="platform-brand">
            <span className="platform-brand__mark"><img src="/ouedna/ouedna-mark-new.png" alt="" /></span>
            <span><strong>وادنا</strong><small>Ouedna · Wadi Souf</small></span>
          </Link>
          <nav className="platform-nav" aria-label={t("home")}>
            {items.map(([href, labelKey, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""}><Icon size={16} />{t(labelKey)}</Link>)}
          </nav>
          <div className="platform-header__actions">
            <label className="platform-language" aria-label={t("language")}>
              <Globe2 size={15} />
              <select value={lang} onChange={(event) => setLang(event.target.value as typeof lang)}>
                <option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option>
              </select>
            </label>
            <PwaInstallButton />
            <Link className="platform-download-link" href="/download"><Download size={15} /> {t("downloadApp")}</Link>
          </div>
        </div>
      </header>
      <nav className="platform-mobile-nav" aria-label={t("home")}>
        {mobileItems.map(([href, labelKey, Icon]) => <Link key={href} href={href} className={active === href ? "is-active" : ""}><Icon size={19} /><span>{t(labelKey)}</span></Link>)}
      </nav>
    </>
  );
}
