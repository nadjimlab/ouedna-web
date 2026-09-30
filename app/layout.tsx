import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import "./design-system.css";
import "./platform.css";
import "./app-shell.css";
import "./app-pages.css";
import "./responsive-fixes.css";
import "./map/custom-style.css";
import "./archive-enhancements.css";
import "./guide.css";
import "./itinerary.css";
import "./pwa-install.css";
import "./premium-overhaul.css";
import "./pano360.css";
import "./desert.css";
import "leaflet/dist/leaflet.css";
import "./world-class.css";
import "./glass-cards.css";
import "./explore-glass.css";
import "./home-hero.css";
import "./platform-fixes.css";
import PwaRuntime from "./PwaRuntime";
import { siteConfig } from "./metadata";
import AppProviders from "@/components/AppProviders";
import type { Lang } from "@/lib/i18n";

const siteName = "Ouedna | وادنا";
const siteTitle = "وادنا Ouedna | اكتشف وادي سوف على إيقاعك";
const siteDescription = "وادنا هو الدليل السياحي الذكي لاكتشاف ولاية الوادي: المعالم، الواحات، الأسواق، التراث، والخرائط في تطبيق واحد.";
const siteUrl = siteConfig.url;
const panoramicOgImage = siteConfig.ogImage;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), title: siteTitle, description: siteDescription, applicationName: "Ouedna",
  keywords: ["وادنا", "وادي سوف", "ولاية الوادي", "السياحة في الوادي", "معالم الوادي", "Wadi Souf", "El Oued tourism"],
  authors: [{ name: "Ouedna" }], creator: "Ouedna", publisher: "Ouedna", category: "travel",
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }, { url: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
  alternates: { canonical: "/" }, openGraph: { type: "website", locale: "ar_DZ", url: siteUrl, siteName, title: siteTitle, description: siteDescription, images: [{ url: panoramicOgImage, width: 1600, height: 900, alt: "واحة وادي سوف - وادنا" }] },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: [panoramicOgImage] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0F3D2E" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const localeCookie = (await cookies()).get("ouedna.language")?.value;
  const initialLang: Lang = localeCookie === "en" || localeCookie === "fr" ? localeCookie : "ar";
  const initialDir = initialLang === "ar" ? "rtl" : "ltr";
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", name: siteName, url: siteUrl, description: siteDescription, inLanguage: initialLang, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/explore?q={search_term_string}`, "query-input": "required name=search_term_string" } }, { "@type": "TouristDestination", name: "وادي سوف", description: siteDescription, url: siteUrl, containedInPlace: { "@type": "Country", name: "الجزائر" } }, { "@type": "Organization", name: siteName, url: siteUrl, logo: `${siteUrl}/icons/icon-512.png` }] };
  return <html lang={initialLang} dir={initialDir} className="h-full antialiased"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Noto+Kufi+Arabic:wght@100..900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" /><link rel="alternate" type="application/rss+xml" title="أحدث معالم وادنا السياحية" href="/feed.xml" /><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7835405033186018" crossOrigin="anonymous" /></head><body className="min-h-full overflow-x-hidden"><PwaRuntime /><a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-amber-600 focus:px-4 focus:py-2 focus:text-white">الانتقال إلى المحتوى الرئيسي</a><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><AppProviders initialLang={initialLang}><div id="main-content">{children}</div></AppProviders></body></html>;
}
