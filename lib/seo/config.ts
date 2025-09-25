import { Metadata } from 'next'

// SEO Configuration Constants
export const SEO_CONFIG = {
  siteName: 'Wan 2.5 animate',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://wan-animate.com',
  companyName: 'Wan 2.5 animate',
  description: 'Animate any character from a source video with AI-powered motion transfer technology. Create stunning character animations effortlessly.',
  keywords: [
    'character animation',
    'AI animation',
    'motion transfer',
    'video animation',
    'source video animation',
    'character rigging',
    'AI motion capture',
    'animation tools',
    'video to animation',
    '2D animation',
    '3D animation',
    'AI animation software',
    'character movement',
    'animate from video',
    'AI character animation',
    'professional animation',
    'animation workflow',
    'motion synthesis'
  ],
  images: {
    default: '/og-image.jpg',
    logo: '/logo.svg'
  },
  social: {
    twitter: '@wan2animate',
    facebook: 'wan2animate',
    linkedin: 'company/wan2animate'
  }
}

// Default Metadata
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: `${SEO_CONFIG.siteName} - Animate any character from a source video`,
    template: `%s | ${SEO_CONFIG.siteName}`
  },
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  authors: [{ name: SEO_CONFIG.companyName }],
  creator: SEO_CONFIG.companyName,
  publisher: SEO_CONFIG.companyName,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png'
  },
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
    title: `${SEO_CONFIG.siteName} - Animate any character from a source video`,
    description: SEO_CONFIG.description,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: SEO_CONFIG.images.default,
        width: 1200,
        height: 630,
        alt: `${SEO_CONFIG.siteName} - Animate any character from a source video`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SEO_CONFIG.siteName} - Animate any character from a source video`,
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
    title: 'Wan 2.5 animate - Animate any character from a source video',
    description: 'Transform any character with AI-powered animation from source videos. Create stunning character animations with advanced motion transfer technology - animate characters effortlessly.',
    keywords: ['character animation', 'AI animation', 'motion transfer', 'video animation', 'animate from source video']
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