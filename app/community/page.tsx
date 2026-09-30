import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import CommunityClient from "./CommunityClient";
import PageHero from "@/components/platform/PageHero";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

async function getExperiences() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase.from("testimonials").select("id,name,message,photos,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(30);
  return data || [];
}

export default async function CommunityPage() {
  const experiences = await getExperiences();
  return <PlatformFrame active="/community"><section className="platform-page platform-community-page"><PageHero eyebrow="communityEyebrow" title="communityHeroTitle" description="communityHeroDescription" image="/ouedna/palm-oasis.jpg" imageAlt="communityHeroAlt" /><div className="platform-container"><CommunityClient experiences={experiences} /></div></section></PlatformFrame>;
}
