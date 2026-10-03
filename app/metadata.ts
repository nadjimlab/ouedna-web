import type { Metadata } from "next";

// مصدر واحد لمعلومات SEO الرسمية للموقع، تُستخدم في sitemap.xml و robots.txt.
export const siteConfig = {
  title: "وادنا Ouedna | الدليل السياحي الذكي لوادي سوف",
  description:
    "وادنا منصة سياحية ذكية لاكتشاف معالم ولاية الوادي وواحاتها وأسواقها وتراثها عبر خريطة تفاعلية متكاملة.",
  url: "https://myeloued.com",
  ogImage: "/ouedna/ouedna-hero-new.jpg",
  siteName: "وادنا Ouedna",
  locale: "ar_DZ",
};

export function pageMetadata({ title, description, path, image = siteConfig.ogImage, type = "website" }: { title: string; description: string; path: string; image?: string; type?: "website" | "article" }) : Metadata {
  const url = `${siteConfig.url}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${siteConfig.url}${image}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: { type, title, description, url, siteName: siteConfig.siteName, locale: siteConfig.locale, images: [{ url: imageUrl, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}
