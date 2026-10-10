import { createPublicClient } from "@/lib/supabase/public";
import PlatformFrame from "@/components/platform/PlatformFrame";
import ArchiveClient from "./ArchiveClient";
import type { Metadata } from "next";
import { pageMetadata } from "@/app/metadata";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  title: "تراث وتاريخ وادي سوف | أرشيف الوادي | وادنا",
  description: "تصفح أرشيف وادنا للصور والذكريات والمواد التراثية المرتبطة بتاريخ وثقافة وعمارة وادي سوف.",
  path: "/archive",
});

function imageList(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(imageList);
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try { const parsed = JSON.parse(trimmed) as unknown; if (Array.isArray(parsed)) return parsed.flatMap(imageList); } catch { /* Keep legacy comma parsing below. */ }
  }
  return trimmed.replace(/[\[\]"']/g, "").split(",").map((image) => image.trim()).filter(Boolean);
}

function uniqueImages(...values: unknown[]) { return Array.from(new Set(values.flatMap(imageList))); }

async function getMemories() {
  const supabase = createPublicClient(600);
  const [{ data: memories, error: memoriesError }, { data: heritage, error: heritageError }] = await Promise.all([
    supabase.from("old_memories").select("id,image_url,gallery,caption,year,created_at").order("created_at", { ascending: false }),
    supabase.from("heritage").select("id,image,gallery,title,text,year,created_at").order("created_at", { ascending: false }),
  ]);
  if (memoriesError || heritageError) return [];
  return [...(memories || []).map((item) => ({ id: `memory-${item.id}`, caption: item.caption, year: item.year, created_at: item.created_at, images: uniqueImages(item.image_url, item.gallery) })), ...(heritage || []).map((item) => ({ id: `heritage-${item.id}`, caption: item.title ? `${item.title}${item.text ? ` — ${item.text}` : ""}` : item.text, year: item.year, created_at: item.created_at, images: uniqueImages(item.image, item.gallery) }))].filter((item) => item.images.length > 0);
}

export default async function ArchivePage() {
  const memories = await getMemories();
  return <PlatformFrame active="/archive"><section className="platform-page platform-archive-page"><ArchiveClient memories={memories} /></section></PlatformFrame>;
}
