import { supabase } from "@/lib/supabase/client";
import { imageUploadPath } from "@/lib/validation/upload";

export const IMAGES_BUCKET = "images";

export async function uploadPlaceImages(files) {
  const urls = [];
  for (const file of files) {
    const path = imageUploadPath("public", file);
    if (!path) throw new Error(`نوع أو حجم الصورة "${file.name}" غير مسموح به.`);

    const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) throw new Error(`فشل رفع الصورة "${file.name}": ${error.message}`);

    const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export function encodeImageUrls(urls) {
  return urls.length > 0 ? JSON.stringify(urls) : null;
}

export function decodeImageUrls(imageUrl) {
  if (!imageUrl) return [];
  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [imageUrl];
  }
}
