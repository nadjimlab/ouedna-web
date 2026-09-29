import type { MetadataRoute } from "next";

const shortcutIcon = "/icons/shortcut-96.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "وادنا Ouedna | دليل وادي سوف",
    short_name: "وادنا",
    description: "تطبيق ويب لاكتشاف معالم وادي سوف، التخطيط للرحلة، والمجتمع المحلي.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    categories: ["travel", "navigation"],
    background_color: "#0F3D2E",
    theme_color: "#0F3D2E",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "زيارة افتراضية VR", short_name: "زيارة VR", url: "/virtual-tour", icons: [{ src: shortcutIcon, sizes: "96x96", type: "image/png" }] },
      { name: "الخريطة", short_name: "الخريطة", url: "/map", icons: [{ src: shortcutIcon, sizes: "96x96", type: "image/png" }] },
      { name: "استكشف", short_name: "استكشف", url: "/explore", icons: [{ src: shortcutIcon, sizes: "96x96", type: "image/png" }] },
      { name: "خط رحلتي", short_name: "رحلتي", url: "/itinerary", icons: [{ src: shortcutIcon, sizes: "96x96", type: "image/png" }] },
    ],
    screenshots: [
      { src: "/screenshots/pwa-phone.png", sizes: "390x844", type: "image/png", form_factor: "narrow", label: "وادنا على الهاتف" },
      { src: "/screenshots/pwa-desktop.png", sizes: "1280x720", type: "image/png", form_factor: "wide", label: "وادنا على الحاسوب" },
    ],
  };
}
