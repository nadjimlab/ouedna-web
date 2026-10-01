import { supabase } from '@/lib/supabase/client';
import { decodeImageUrls } from '@/services/places';

export type PlaceCategory = string;
export type PlacePopularity = "high" | "medium" | "low";

export interface Place {
  id: number;
  name: string;
  subtitle: string;
  category: PlaceCategory;
  municipality: string;
  district?: string;
  popularity: PlacePopularity;
  lat: number;
  lng: number;
  rating?: number;
  image: string;
  description: string;
  location: string;
  tags: string[];
  phone?: string;
  website?: string;
  openingHours?: string;
}

const excludedPublicCategories = new Set(['مرافق صحية', 'صحي', 'طبي', 'مستشفيات', 'مصحات خاصة', 'صيدليات']);

export async function getPlacesFromDB(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('status', 'منشور')
    .order('id', { ascending: false });

  if (error || !data) {
    console.error("خطأ في جلب البيانات من قاعدة البيانات:", error);
    return [];
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.filter((item) => !excludedPublicCategories.has(String(item.category || item.main_category || '')) && typeof item.lat === 'number' && typeof item.lng === 'number').map((item) => {
    const images = decodeImageUrls(item.image_url);
    const finalImage = images[0] || "/images/images.jpg";
    const name = String(item.name || "معلم سياحي");
    const description = typeof item.description === "string" ? item.description : "";
    const category = String(item.category || item.main_category || "تاريخ وثقافة");

    return {
      id: Number(item.id),
      name,
      subtitle: description ? description.substring(0, 40) + "..." : name,
      category,
      municipality: String(item.municipality || "الوادي"),
      district: String(item.district || "الوادي"),
      popularity: "high",
      lat: item.lat as number,
      lng: item.lng as number,
      rating: typeof item.rating === 'number' && item.rating > 0 ? item.rating : undefined,
      image: finalImage,
      description,
      location: String(item.municipality || "الوادي"),
      tags: [category || 'سياحة'],
      phone: typeof item.phone === "string" ? item.phone : undefined,
      website: typeof item.website === "string" ? item.website : undefined,
      openingHours: typeof item.opening_hours === "string" ? item.opening_hours : undefined,
    };
  });
}
