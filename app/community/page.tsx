import { createPublicClient } from "@/lib/supabase/public";
import PlatformFrame from "@/components/platform/PlatformFrame";
import CommunityClient from "./CommunityClient";
import PageHero from "@/components/platform/PageHero";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  title: "تجارب زوار وادي سوف | مجتمع وادنا",
  description: "اقرأ تجارب زوار وادنا المنشورة بعد المراجعة، وشارك تجربتك الحقيقية من معالم وادي سوف.",
  path: "/community",
});

async function getExperiences() {
  const supabase = createPublicClient(60);
  const { data } = await supabase.from("testimonials").select("id,name,message,photos,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(30);
  return data || [];
}

export default async function CommunityPage() {
  const experiences = await getExperiences();
  return <PlatformFrame active="/community"><section className="platform-page platform-community-page"><PageHero eyebrow="communityEyebrow" title="communityHeroTitle" description="communityHeroDescription" image="/ouedna/palm-oasis.jpg" imageAlt="communityHeroAlt" /><div className="platform-container"><CommunityClient experiences={experiences} /></div></section></PlatformFrame>;
}
