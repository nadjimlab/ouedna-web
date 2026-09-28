import type { Metadata } from "next";
import Image from "next/image";
import PlatformFrame from "@/components/platform/PlatformFrame";
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
      <section className="home-fullscreen" aria-label="واحة وادي سوف">
        <Image
          src="/ouedna/ouedna-hero-new.jpg"
          alt="واحة وادي سوف عند الغروب"
          fill
          priority
          sizes="100vw"
          className="home-fullscreen__image"
        />
      </section>
    </PlatformFrame>
  );
}
