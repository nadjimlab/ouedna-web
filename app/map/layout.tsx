import type { Metadata } from "next";
import { pageMetadata } from "@/app/metadata";

export const metadata: Metadata = pageMetadata({
  title: "خريطة الوادي السياحية | خريطة وادي سوف | وادنا",
  description: "استكشف معالم الوادي ووادي سوف على خريطة سياحية تفاعلية، وابحث عن الأماكن والمسارات المناسبة لرحلتك.",
  path: "/map",
});

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
