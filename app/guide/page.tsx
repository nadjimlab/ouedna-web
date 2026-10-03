import PlatformFrame from "@/components/platform/PlatformFrame";
import GuideClient from "./GuideClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/metadata";

export const metadata: Metadata = pageMetadata({
  title: "دليل زيارة الوادي ووادي سوف | وادنا",
  description: "دليل وادنا العملي لاكتشاف معالم الوادي وواحات وادي سوف، مع روابط مباشرة للخريطة وخط الرحلة والمعالم المنشورة.",
  path: "/guide",
});

export default function GuidePage() { return <PlatformFrame active="/"><GuideClient /></PlatformFrame>; }
