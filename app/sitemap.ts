import { MetadataRoute } from 'next'
import { SEO_CONFIG } from '@/lib/seo/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    {
      url: SEO_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    }
  ]

  return routes
}