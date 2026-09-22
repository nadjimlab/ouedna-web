import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// تهيئة عميل Supabase باستخدام متغيرات البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ouedna.myeloued.com'

  // 1. الروابط الثابتة للموقع
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }
  ]

  // 2. جلب الروابط الديناميكية من Supabase
  // استبدل 'places' باسم الجدول الفعلي لديك، و 'id' باسم عمود المُعرّف
  const { data: places, error } = await supabase
    .from('places')
    .select('id, created_at') 
    // .eq('status', 'approved') // يمكنك إزالة التعليق لجلب الأماكن المعتمدة فقط

  let dynamicRoutes: MetadataRoute.Sitemap = []

  if (places && !error) {
    dynamicRoutes = places.map((place) => ({
      url: `${baseUrl}/place/${place.id}`,
      // إذا كان لديك عمود لتاريخ التحديث، يفضل استخدامه بدلاً من تاريخ الإنشاء
      lastModified: place.created_at ? new Date(place.created_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  }

  // 3. دمج وإرجاع جميع الروابط
  return [...staticRoutes, ...dynamicRoutes]
}
