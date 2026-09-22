import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ouedna.myeloued.com'

  return [
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
    // ملاحظة: يمكنك لاحقاً جلب بيانات الأماكن من Supabase هنا 
    // وإرجاع مصفوفة تتضمن روابط كل معلم بشكل ديناميكي (مثل /place/15)
  ]
}
