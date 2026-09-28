import type { Metadata } from "next";
import PlatformFrame from "@/components/platform/PlatformFrame";
import HomeHero from "@/components/home/HomeHero";
import { siteConfig } from "@/app/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وادنا | اكتشف وادي سوف",
  description: "المنصة السياحية الرسمية لاكتشاف معالم واحات وتراث ولاية الوادي.",
  alternates: { canonical: siteConfig.url },
};

export default function HomePage() {
  return (
    <PlatformFrame active="/" immersive>
      <HomeHero />
    </PlatformFrame>
  );
}
