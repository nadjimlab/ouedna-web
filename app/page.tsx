import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, MapPinned } from "lucide-react";
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
      <section className="home-fullscreen" aria-label="مرحباً بك في منصة وادنا">
        <Image
          src="/ouedna/ouedna-hero-new.jpg"
          alt="واحة وادي سوف عند الغروب"
          fill
          priority
          sizes="100vw"
          className="home-fullscreen__image"
        />
        <div className="home-fullscreen__content">
          <span className="home-fullscreen__eyebrow">المنصة السياحية الرسمية لولاية الوادي</span>
          <h1>مرحباً بك في <em>وادنا</em></h1>
          <p>دليلك لاكتشاف وادي سوف، معالمه، وواحاته وتجارب أهله.</p>
          <div className="home-fullscreen__actions">
            <Link href="/explore" className="home-fullscreen__primary">
              <Compass size={18} />
              دخول إلى المنصة
              <ArrowLeft size={16} />
            </Link>
            <Link href="/map" className="home-fullscreen__secondary">
              <MapPinned size={17} />
              الخريطة التفاعلية
            </Link>
          </div>
        </div>
      </section>
    </PlatformFrame>
  );
}
