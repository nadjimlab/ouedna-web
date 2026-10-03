import PlatformFrame from "@/components/platform/PlatformFrame";
import ItineraryClient from "./ItineraryClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/metadata";

export const metadata: Metadata = pageMetadata({
  title: "خط رحلة الوادي | برنامج سياحي في وادي سوف | وادنا",
  description: "خطط رحلة عملية في الوادي ووادي سوف، واختر المعالم التي تهمك واحفظ محطاتك وشارك مسارك.",
  path: "/itinerary",
});

export default function ItineraryPage() { return <PlatformFrame active="/"><ItineraryClient /></PlatformFrame>; }
