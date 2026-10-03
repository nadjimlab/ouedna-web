import { MetadataRoute } from 'next'
import { siteConfig } from './metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // منع الواجهات الحساسة ولوحة الإدارة مع إبقاء CSS/JS الضروريين قابلة للوصول
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
