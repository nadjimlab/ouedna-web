"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type CSSProperties } from "react";
import { ArrowLeft, Globe2, History, Map as MapIcon, Route } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants } from "framer-motion";
import { LANGUAGES, useLanguage, type DictKey } from "@/lib/i18n";

const FEATURES: { href: string; key: DictKey; Icon: typeof Route }[] = [
  { href: "/itinerary", key: "homeFeatTrip", Icon: Route },
  { href: "/archive", key: "homeFeatArchive", Icon: History },
  { href: "/map", key: "homeFeatMaps", Icon: MapIcon },
];

// ذرّات رمل ثابتة القيم (لا عشوائية) حتى لا يحدث عدم تطابق بين الخادم والمتصفح.
const GRAINS = Array.from({ length: 30 }, (_, i) => ({
  top: 8 + ((i * 31 + 7) % 84),
  size: 1.5 + (i % 4) * 0.8,
  dur: 10 + (i % 7) * 2.2,
  delay: -((i * 1.9) % 18),
  drift: 60 + (i % 5) * 40,
}));

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomeHero() {
  const { lang, setLang, t } = useLanguage();
  const reduce = useReducedMotion();

  // بارالاكس خفيف مع حركة المؤشر/الإمالة على الشاشات الكبيرة.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18 });
  const sy = useSpring(my, { stiffness: 40, damping: 18 });
  const imgX = useTransform(sx, (v) => v * -18);
  const imgY = useTransform(sy, (v) => v * -12);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const nextLang = () => {
    const i = LANGUAGES.findIndex((l) => l.code === lang);
    setLang(LANGUAGES[(i + 1) % LANGUAGES.length].code);
  };

  return (
    <section className="hh" aria-label={t("homeTitle")}>
      <motion.div className="hh__bg" style={{ x: imgX, y: imgY }} aria-hidden="true">
        <Image src="/ouedna/ouedna-hero-new.jpg" alt="" fill priority sizes="100vw" className="hh__img" />
      </motion.div>
      <div className="hh__sun" aria-hidden="true" />
      <div className="hh__shade" aria-hidden="true" />
      <div className="hh__grains" aria-hidden="true">
        {GRAINS.map((g, i) => (
          <i
            key={i}
            style={{
              top: `${g.top}%`,
              width: g.size,
              height: g.size,
              animationDuration: `${g.dur}s`,
              animationDelay: `${g.delay}s`,
              "--drift": `${g.drift}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      <motion.div className="hh__inner" variants={container} initial={reduce ? "show" : "hidden"} animate="show">
        <motion.div className="hh__top" variants={rise}>
          <span className="hh__logo">
            <Image src="/ouedna/ouedna-mark-new.png" alt="Ouedna" width={84} height={84} priority />
          </span>
          <button type="button" className="hh__lang" onClick={nextLang} aria-label={t("language")}>
            <Globe2 size={20} aria-hidden="true" />
            {current.label}
          </button>
        </motion.div>

        <div className="hh__copy">
          <motion.span className="hh__badge" variants={rise}>{t("homeBadge")}</motion.span>
          <motion.h1 className="hh__title" variants={rise}>{t("homeTitle")}</motion.h1>
          <motion.p className="hh__tagline" variants={rise}>{t("homeTagline")}</motion.p>
          <motion.p className="hh__intro" variants={rise}>{t("homeIntro")}</motion.p>

          <motion.ul className="hh__features" variants={rise}>
            {FEATURES.map(({ href, key, Icon }) => (
              <li key={href}>
                <Link href={href}>
                  <span className="hh__ficon"><Icon size={20} aria-hidden="true" /></span>
                  <span>{t(key)}</span>
                </Link>
              </li>
            ))}
          </motion.ul>

          <motion.div className="hh__actions" variants={rise}>
            <Link href="/explore" className="hh__cta">
              <span>{t("homeCta")}</span>
              <ArrowLeft size={20} className="hh__arrow" aria-hidden="true" />
            </Link>
            <Link href="/explore" className="hh__guest">{t("homeGuest")}</Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
