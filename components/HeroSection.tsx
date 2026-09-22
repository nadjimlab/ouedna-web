"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpLeft,
  Compass,
  MapPin,
  Sparkles,
} from "lucide-react";

export interface HeroSectionProps {
  eyebrow?: string;
  title?: string;
  highlightedTitle?: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  imageAlt?: string;
}

const defaultProps: Required<
  Pick<
    HeroSectionProps,
    | "eyebrow"
    | "title"
    | "highlightedTitle"
    | "description"
    | "primaryCta"
    | "secondaryCta"
    | "imageAlt"
  >
> = {
  eyebrow: "الدليل الرسمي لوادي سوف",
  title: "اكتشف المكان",
  highlightedTitle: "بطريقتك.",
  description:
    "خطط رحلتك بين الواحات والكثبان والمعالم المحلية، واكتشف وادي سوف بتجربة ذكية وواضحة.",
  primaryCta: {
    label: "ابدأ الاستكشاف",
    href: "/explore",
  },
  secondaryCta: {
    label: "افتح الخريطة",
    href: "/map",
  },
  imageAlt: "واحة صحراوية مع نخيل وكثبان رملية",
};

export default function HeroSection({
  eyebrow = defaultProps.eyebrow,
  title = defaultProps.title,
  highlightedTitle = defaultProps.highlightedTitle,
  description = defaultProps.description,
  primaryCta = defaultProps.primaryCta,
  secondaryCta = defaultProps.secondaryCta,
  imageAlt = defaultProps.imageAlt,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const easing = [0.22, 1, 0.36, 1] as const;

  const revealAnimation = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: easing },
  };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[#f7f6f1] text-[#123d35]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(214,166,83,0.16),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(18,61,53,0.08),transparent_30%)]"
      />

      <div className="mx-auto grid min-h-[680px] w-full max-w-7xl grid-cols-1 items-center gap-14 px-6 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-12 lg:py-24">
        <div className="order-2 max-w-2xl text-right lg:order-1">
          <motion.div
            {...revealAnimation}
            transition={{
              ...revealAnimation.transition,
              delay: 0.05,
            }}
            className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#123d35]/10 bg-white/70 px-4 py-2 text-xs font-bold text-[#b47d20] shadow-sm backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-[#d6a653] shadow-[0_0_0_5px_rgba(214,166,83,0.16)]" />
            {eyebrow}
          </motion.div>

          <motion.h1
            id="hero-title"
            {...revealAnimation}
            transition={{
              ...revealAnimation.transition,
              delay: 0.12,
            }}
            className="max-w-xl text-5xl font-black leading-tight tracking-tighter text-[#123d35] sm:text-6xl lg:text-8xl"
          >
            {title}
            <br />
            <span className="text-[#d6a653]">{highlightedTitle}</span>
          </motion.h1>

          <motion.p
            {...revealAnimation}
            transition={{
              ...revealAnimation.transition,
              delay: 0.2,
            }}
            className="mt-7 max-w-lg text-base leading-8 text-slate-600 sm:text-lg"
          >
            {description}
          </motion.p>

          <motion.div
            {...revealAnimation}
            transition={{
              ...revealAnimation.transition,
              delay: 0.28,
            }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-end"
          >
            <Link
              href={primaryCta.href}
              className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#d6a653] px-6 text-sm font-black text-[#241b10] shadow-[0_16px_30px_rgba(214,166,83,0.24)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(214,166,83,0.34)] active:scale-95"
            >
              <Compass
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:rotate-12"
                size={19}
              />
              {primaryCta.label}
              <ArrowUpLeft
                aria-hidden="true"
                size={17}
                className="transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1"
              />
            </Link>

            <Link
              href={secondaryCta.href}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-[#123d35]/15 bg-white/70 px-6 text-sm font-black text-[#123d35] shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-[#123d35]/30 hover:bg-white active:scale-95"
            >
              <MapPin aria-hidden="true" size={18} />
              {secondaryCta.label}
            </Link>
          </motion.div>

          <motion.div
            {...revealAnimation}
            transition={{
              ...revealAnimation.transition,
              delay: 0.36,
            }}
            className="mt-8 flex items-center justify-end gap-5 text-xs font-bold text-slate-500"
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
              بيانات محلية موثوقة
            </span>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="hidden items-center gap-2 sm:inline-flex">
              <Sparkles aria-hidden="true" size={14} />
              تجربة ذكية
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            scale: shouldReduceMotion ? 1 : 0.96,
            y: shouldReduceMotion ? 0 : 16,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.12,
            ease: easing,
          }}
          className="order-1 lg:order-2"
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-white/80 bg-[#123d35] p-3 shadow-[0_30px_80px_rgba(18,61,53,0.2)] sm:aspect-[5/4] lg:aspect-[4/5]">
            <div className="relative h-full overflow-hidden rounded-[1.5rem] bg-[#dbe7dc]">
              <svg
                role="img"
                aria-labelledby="hero-illustration-title hero-illustration-description"
                viewBox="0 0 720 900"
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
              >
                <title id="hero-illustration-title">{imageAlt}</title>
                <desc id="hero-illustration-description">
                  رسم توضيحي لواحة خضراء وسط الكثبان الرملية.
                </desc>

                <defs>
                  <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b5549" />
                    <stop offset="55%" stopColor="#6f8e73" />
                    <stop offset="100%" stopColor="#d6a653" />
                  </linearGradient>

                  <linearGradient id="heroDune" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e5bc72" />
                    <stop offset="100%" stopColor="#a96f2d" />
                  </linearGradient>

                  <linearGradient id="heroOasis" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#174f42" />
                    <stop offset="100%" stopColor="#0b3029" />
                  </linearGradient>

                  <filter id="heroBlur">
                    <feGaussianBlur stdDeviation="16" />
                  </filter>
                </defs>

                <rect width="720" height="900" fill="url(#heroSky)" />

                <circle
                  cx="555"
                  cy="205"
                  r="110"
                  fill="#f3d996"
                  opacity="0.82"
                  filter="url(#heroBlur)"
                />

                <path
                  d="M0 530C135 410 240 430 360 500C470 564 574 566 720 420V900H0Z"
                  fill="url(#heroDune)"
                />

                <path
                  d="M0 670C145 560 278 600 390 664C520 738 621 720 720 624V900H0Z"
                  fill="#8e5e2b"
                  opacity="0.82"
                />

                <path
                  d="M0 704C145 630 283 652 407 718C536 786 625 768 720 700V900H0Z"
                  fill="url(#heroOasis)"
                />

                <ellipse
                  cx="370"
                  cy="650"
                  rx="188"
                  ry="42"
                  fill="#c5d5bf"
                  opacity="0.5"
                />

                <path
                  d="M152 704C170 615 177 524 164 428M164 492C119 452 91 426 72 382M163 514C207 466 234 430 249 377M253 712C269 623 278 550 267 472M268 529C315 489 346 450 359 397"
                  fill="none"
                  stroke="#173f35"
                  strokeLinecap="round"
                  strokeWidth="18"
                />

                <path
                  d="M156 432C119 384 96 352 83 302C137 322 174 359 182 415ZM174 418C212 363 239 331 281 308C267 361 232 399 181 445ZM260 478C232 429 216 391 218 347C265 371 286 414 278 475ZM275 458C319 414 351 389 393 381C371 427 335 456 278 482Z"
                  fill="#dfe9d1"
                />

                <circle cx="390" cy="620" r="8" fill="#e4ad4c" />
                <circle cx="415" cy="638" r="5" fill="#e4ad4c" />
                <circle cx="442" cy="610" r="6" fill="#e4ad4c" />

                <g transform="translate(480 470)">
                  <path d="M0 120L56 72L112 120V190H0Z" fill="#e4d1a3" />
                  <path d="M-12 122L56 54L124 122" fill="none" stroke="#f8eed6" strokeWidth="13" />
                  <path d="M43 190V135H69V190" fill="#8d6434" />
                  <path d="M20 126H38V148H20ZM78 126H96V148H78Z" fill="#8d6434" />
                </g>

                <path
                  d="M0 810C150 760 300 790 470 842C588 878 665 850 720 820"
                  fill="none"
                  stroke="#e4ad4c"
                  strokeLinecap="round"
                  strokeWidth="5"
                  opacity="0.7"
                />
              </svg>

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between rounded-2xl border border-white/20 bg-[#123d35]/65 p-4 text-white backdrop-blur-md">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e4ad4c]">
                    Wadi Souf
                  </span>
                  <strong className="mt-1 block text-lg font-black tracking-tight">
                    قلب الصحراء ينبض هنا
                  </strong>
                </div>

                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d6a653] text-[#123d35]">
                  <MapPin aria-hidden="true" size={18} />
                </span>
              </div>
            </div>

            <div className="pointer-events-none absolute -left-5 top-10 h-24 w-24 rounded-full border border-[#d6a653]/40 bg-[#d6a653]/10 blur-sm" />
            <div className="pointer-events-none absolute -right-6 bottom-16 h-32 w-32 rounded-full border border-white/20 bg-white/10 blur-sm" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
