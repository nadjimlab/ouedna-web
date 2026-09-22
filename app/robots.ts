import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'], // منع أرشفة الملفات الداخلية والواجهات البرمجية
    },
    sitemap: 'https://ouedna.myeloued.com/sitemap.xml',
  }
}
