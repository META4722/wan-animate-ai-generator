'use client'

import { usePathname } from 'next/navigation'
import Head from 'next/head'
import { SEO_CONFIG } from '@/lib/seo/config'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  canonical?: string
  noindex?: boolean
  structuredData?: any[]
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  canonical,
  noindex = false,
  structuredData = []
}: SEOHeadProps) {
  const pathname = usePathname()
  
  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : `${SEO_CONFIG.siteName} - AI建筑渲染平台`
  
  const metaDescription = description || SEO_CONFIG.description
  const metaKeywords = keywords?.join(', ') || SEO_CONFIG.keywords.join(', ')
  const metaImage = image || SEO_CONFIG.images.default
  const canonicalUrl = canonical || `${SEO_CONFIG.siteUrl}${pathname}`
  const fullImageUrl = metaImage.startsWith('http') ? metaImage : `${SEO_CONFIG.siteUrl}${metaImage}`

  return (
    <Head>
      {/* 基础元数据 */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={SEO_CONFIG.companyName} />
      <meta name="publisher" content={SEO_CONFIG.companyName} />
      
      {/* 机器人指令 */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
      
      {/* 规范化URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* 网站图标 */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SEO_CONFIG.social.twitter} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* 主题色 */}
      <meta name="theme-color" content="#b09df2" />
      <meta name="msapplication-TileColor" content="#b09df2" />
      
      {/* 结构化数据 */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  )
}