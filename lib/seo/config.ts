import { Metadata } from 'next'

// SEO Configuration Constants
export const SEO_CONFIG = {
  siteName: 'Rendaily',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://rendaily.com',
  companyName: 'Rendaily',
  description: 'Unleash creativity, make design simple. AI-powered architectural rendering platform for architects and designers with text-to-render, sketch-to-render, and professional visualization tools.',
  keywords: [
    'architectural rendering',
    'AI rendering',
    'architectural visualization',
    'design tools',
    'text to render',
    'sketch to render',
    'image upscaling',
    'architect tools',
    'designer platform',
    '3D rendering',
    'AI design software',
    'building visualization',
    'elevation to render',
    'image to render',
    'AI architectural tools',
    'professional rendering',
    'design workflow',
    'visual architecture'
  ],
  images: {
    default: '/og-image.jpg',
    logo: '/logo.svg'
  },
  social: {
    twitter: '@rendaily',
    facebook: 'rendaily',
    linkedin: 'company/rendaily'
  }
}

// Default Metadata
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: `${SEO_CONFIG.siteName} - AI Architectural Rendering Platform`,
    template: `%s | ${SEO_CONFIG.siteName}`
  },
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  authors: [{ name: SEO_CONFIG.companyName }],
  creator: SEO_CONFIG.companyName,
  publisher: SEO_CONFIG.companyName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: {
    canonical: SEO_CONFIG.siteUrl
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SEO_CONFIG.siteUrl,
    title: `${SEO_CONFIG.siteName} - AI Architectural Rendering Platform`,
    description: SEO_CONFIG.description,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: SEO_CONFIG.images.default,
        width: 1200,
        height: 630,
        alt: `${SEO_CONFIG.siteName} - AI Architectural Rendering Platform`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SEO_CONFIG.siteName} - AI Architectural Rendering Platform`,
    description: SEO_CONFIG.description,
    images: [SEO_CONFIG.images.default],
    creator: SEO_CONFIG.social.twitter
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  }
}

// Page SEO Configuration Mapping
export const PAGE_SEO: Record<string, Partial<Metadata>> = {
  '/': {
    title: 'AI Architectural Rendering Platform - Unleash Creativity, Make Design Simple',
    description: 'Professional AI-powered architectural rendering platform supporting text-to-render, sketch-to-render, image upscaling and more. Efficient creative tools for architects and designers - generate professional renderings in minutes.',
    keywords: ['AI architectural rendering', 'text to render', 'architectural visualization', 'design tools', 'architect platform']
  },
  '/pricing': {
    title: 'Pricing Plans - Choose Your Perfect Plan',
    description: 'Explore Rendaily\'s subscription plans from free to enterprise tiers. Find the perfect plan for your architectural rendering needs with AI-powered professional services.',
    keywords: ['pricing plans', 'subscription tiers', 'architectural rendering service', 'AI rendering packages']
  },
  '/features': {
    title: 'Features - Professional AI Rendering Tools Suite',
    description: 'Discover Rendaily\'s core features: text-to-render, sketch-to-render, image upscaling, elevation-to-render and more. AI-driven architectural visualization solutions.',
    keywords: ['product features', 'AI rendering tools', 'text to render', 'sketch to render', 'image processing']
  },
  '/gallery': {
    title: 'Gallery - Showcase of AI Rendering Results',
    description: 'Browse stunning architectural renderings created by users with Rendaily. Experience the power of AI technology in architectural visualization.',
    keywords: ['gallery showcase', 'rendering results', 'AI artwork', 'architectural visualization examples']
  },
  '/dashboard': {
    title: 'Dashboard - Start Your AI Rendering Journey',
    description: 'Access Rendaily dashboard to create architectural visualizations with professional AI rendering tools. Manage your projects and subscriptions.',
    keywords: ['user dashboard', 'AI rendering tools', 'project management', 'architectural design']
  },
  '/about': {
    title: 'About Us - AI-Driven Architectural Rendering Innovation',
    description: 'Learn about Rendaily\'s vision and mission. We\'re dedicated to providing architects and designers with cutting-edge AI rendering technology.',
    keywords: ['about us', 'company information', 'AI technology', 'architectural rendering innovation']
  }
}

// 工具函数：生成页面元数据
export function generatePageMetadata(
  page: string,
  customData?: Partial<Metadata>
): Metadata {
  const pageConfig = PAGE_SEO[page] || {}
  
  return {
    ...defaultMetadata,
    ...pageConfig,
    ...customData,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...pageConfig.openGraph,
      ...customData?.openGraph
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...pageConfig.twitter,
      ...customData?.twitter
    }
  }
}

// 动态页面元数据生成器
export function generateDynamicMetadata({
  title,
  description,
  image,
  path,
  type = 'article'
}: {
  title: string
  description: string
  image?: string
  path: string
  type?: 'article' | 'website'
}): Metadata {
  const url = `${SEO_CONFIG.siteUrl}${path}`
  const ogImage = image || SEO_CONFIG.images.default
  
  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  }
}