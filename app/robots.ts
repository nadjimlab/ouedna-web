import { MetadataRoute } from 'next'
import { siteConfig } from './metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'], // منع أرشفة الملفات الداخلية والواجهات البرمجية
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
