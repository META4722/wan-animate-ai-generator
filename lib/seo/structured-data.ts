import { SEO_CONFIG } from './config'

// Schema.org 结构化数据类型定义
export interface Organization {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  sameAs: string[]
  contactPoint: ContactPoint[]
  description: string
}

export interface WebSite {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  description: string
  publisher: Organization
  potentialAction: SearchAction
}

export interface SearchAction {
  '@type': 'SearchAction'
  target: {
    '@type': 'EntryPoint'
    urlTemplate: string
  }
  'query-input': string
}

export interface ContactPoint {
  '@type': 'ContactPoint'
  telephone?: string
  contactType: string
  availableLanguage: string[]
}

export interface SoftwareApplication {
  '@context': 'https://schema.org'
  '@type': 'SoftwareApplication'
  name: string
  operatingSystem: string
  applicationCategory: string
  offers: Offer[]
  description: string
  publisher: Organization
  url: string
  screenshot: string[]
}

export interface Offer {
  '@type': 'Offer'
  price: string
  priceCurrency: string
  name: string
  description: string
  availability: string
}

export interface BreadcrumbList {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: ListItem[]
}

export interface ListItem {
  '@type': 'ListItem'
  position: number
  name: string
  item?: string
}

// Organization Schema
export const organizationSchema: Organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.images.logo}`,
  sameAs: [
    `https://twitter.com/${SEO_CONFIG.social.twitter}`,
    `https://facebook.com/${SEO_CONFIG.social.facebook}`,
    `https://linkedin.com/${SEO_CONFIG.social.linkedin}`
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Chinese']
    }
  ],
  description: SEO_CONFIG.description
}

// Website Schema
export const websiteSchema: WebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO_CONFIG.siteName,
  url: SEO_CONFIG.siteUrl,
  description: SEO_CONFIG.description,
  publisher: organizationSchema,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
}

// Software Application Schema
export const softwareApplicationSchema: SoftwareApplication = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SEO_CONFIG.siteName,
  operatingSystem: 'Web Browser',
  applicationCategory: 'DesignApplication',
  description: SEO_CONFIG.description,
  publisher: organizationSchema,
  url: SEO_CONFIG.siteUrl,
  screenshot: [
    `${SEO_CONFIG.siteUrl}/screenshots/dashboard.jpg`,
    `${SEO_CONFIG.siteUrl}/screenshots/render-results.jpg`
  ],
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      name: 'Free Plan',
      description: '10 credits per month, basic features',
      availability: 'https://schema.org/InStock'
    },
    {
      '@type': 'Offer',
      price: '9',
      priceCurrency: 'USD',
      name: 'Starter',
      description: '100 credits per month, standard resolution',
      availability: 'https://schema.org/InStock'
    },
    {
      '@type': 'Offer',
      price: '19',
      priceCurrency: 'USD',
      name: 'Pro',
      description: '300 credits per month, high resolution + batch processing',
      availability: 'https://schema.org/InStock'
    },
    {
      '@type': 'Offer',
      price: '39',
      priceCurrency: 'USD',
      name: 'Studio',
      description: '800 credits per month, 4K output + API access',
      availability: 'https://schema.org/InStock'
    }
  ]
}

// 面包屑导航生成器
export function generateBreadcrumbSchema(items: Array<{name: string, url?: string}>): BreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${SEO_CONFIG.siteUrl}${item.url}` })
    }))
  }
}


// 页面特定的结构化数据
export const pageSchemas = {
  home: [organizationSchema, websiteSchema, softwareApplicationSchema],
  pricing: [organizationSchema, softwareApplicationSchema],
  features: [organizationSchema, softwareApplicationSchema],
  about: [organizationSchema]
}