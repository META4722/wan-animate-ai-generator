import { Metadata } from 'next'

// SEO Configuration Constants
export const SEO_CONFIG = {
  siteName: 'Wanimate AI',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanimate.io',
  companyName: 'Wanimate AI',
  description: 'Create stunning AI-generated videos with Wanimate AI. Transform your ideas into amazing animated content using advanced artificial intelligence technology.',
  keywords: [
    'AI video generation',
    'artificial intelligence video',
    'AI animation',
    'video creation AI',
    'automated video generation',
    'AI content creation',
    'video AI tools',
    'AI video maker',
    'artificial intelligence animation',
    'AI video production',
    'machine learning video',
    'AI video editing',
    'automated animation',
    'AI video platform',
    'video generation software',
    'AI creative tools',
    'intelligent video creation',
    'AI video technology'
  ],
  images: {
    default: '/og-image.jpg',
    logo: '/logo.svg'
  },
  social: {
    twitter: '@wanimate_ai',
    facebook: 'wanimate.ai',
    linkedin: 'company/wanimate-ai'
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
      { url: '/favicon.PNG', type: 'image/png' },
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
    title: 'Wanimate AI - Create Stunning AI-Generated Videos',
    description: 'Transform your ideas into amazing animated content with Wanimate AI. Advanced artificial intelligence technology for professional video generation and animation.',
    keywords: ['AI video generation', 'artificial intelligence video', 'AI animation', 'video creation AI', 'automated video generation']
  },


  '/dashboard': {
    title: 'Dashboard - Manage Your AI Video Projects',
    description: 'Access your Wanimate AI dashboard to manage video projects, track generation history, and control your subscription.',
    keywords: ['user dashboard', 'AI video management', 'project dashboard', 'video generation history']
  },
  '/help': {
    title: 'Help & Support - Wanimate AI Documentation',
    description: 'Get help with Wanimate AI - tutorials, FAQs, and support resources for creating amazing AI-generated videos.',
    keywords: ['help documentation', 'AI video tutorials', 'support guide', 'video generation help']
  },
  '/blog': {
    title: 'Blog - AI Video Generation News & Tutorials',
    description: 'Stay updated with the latest in AI video generation technology, tutorials, and industry insights from Wanimate AI.',
    keywords: ['AI video blog', 'video generation news', 'AI tutorials', 'video technology insights']
  },

}

// 工具函数：生成页面元数据
export function generatePageMetadata(
  page: string,
  customData?: Partial<Metadata>
): Metadata {
  const pageConfig = PAGE_SEO[page] || {}
  const canonicalUrl = `${SEO_CONFIG.siteUrl}${page === '/' ? '' : page}`
  
  return {
    ...defaultMetadata,
    ...pageConfig,
    ...customData,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      ...pageConfig.openGraph,
      ...customData?.openGraph,
      url: canonicalUrl
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