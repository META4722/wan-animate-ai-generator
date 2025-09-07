'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { PAGE_SEO, generateDynamicMetadata } from '@/lib/seo/config'
import { pageSchemas } from '@/lib/seo/structured-data'
import type { Metadata } from 'next'

interface UseSEOOptions {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noindex?: boolean
  customMetadata?: Partial<Metadata>
}

interface SEOData {
  title: string
  description: string
  keywords: string[]
  image?: string
  canonical: string
  structuredData: any[]
  breadcrumbItems: Array<{name: string, href?: string}>
}

export function useSEO(options: UseSEOOptions = {}): SEOData {
  const pathname = usePathname()
  
  return useMemo(() => {
    // 获取当前页面配置
    const pageConfig = PAGE_SEO[pathname] || {}
    
    // 合并配置
    const configTitle = pageConfig.title
    const title = options.title || (typeof configTitle === 'string' ? configTitle : 'AI建筑渲染平台')
    const description = options.description || pageConfig.description || '释放创造力，让设计变简单'
    const keywords = options.keywords || (pageConfig.keywords as string[]) || []
    const images = pageConfig.openGraph?.images
    let image = options.image
    if (!image && images) {
      if (Array.isArray(images)) {
        const firstImage = images[0]
        if (typeof firstImage === 'string') {
          image = firstImage
        } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
          image = firstImage.url as string
        }
      } else {
        if (typeof images === 'string') {
          image = images
        } else if (typeof images === 'object' && 'url' in images) {
          image = (images as any).url
        }
      }
    }
    
    // 生成规范URL
    const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rendaily.com'}${pathname}`
    
    // 获取结构化数据
    const getStructuredData = (): any[] => {
      if (pathname === '/') return pageSchemas.home
      if (pathname === '/pricing') return pageSchemas.pricing
      if (pathname === '/features') return pageSchemas.features
      if (pathname === '/about') return pageSchemas.about
      return []
    }
    
    // Generate breadcrumb items
    const generateBreadcrumbItems = () => {
      const pathSegments = pathname.split('/').filter(Boolean)
      const items: Array<{name: string, href?: string}> = []
      
      // Path mapping
      const pathMap: Record<string, string> = {
        'pricing': 'Pricing',
        'features': 'Features',
        'gallery': 'Gallery',
        'about': 'About Us',
        'dashboard': 'Dashboard',
        'profile': 'Profile',
        'settings': 'Settings',
        'projects': 'My Projects',
        'results': 'Render Results'
      }
      
      let currentPath = ''
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === pathSegments.length - 1
        
        items.push({
          name: pathMap[segment] || segment,
          href: isLast ? undefined : currentPath
        })
      })
      
      return items
    }
    
    return {
      title,
      description,
      keywords,
      image,
      canonical,
      structuredData: getStructuredData(),
      breadcrumbItems: generateBreadcrumbItems()
    }
  }, [pathname, options])
}

// Page-specific SEO Hooks
export function useHomeSEO() {
  return useSEO({
    title: 'AI Architectural Rendering Platform - Unleash Creativity, Make Design Simple',
    description: 'Professional AI-powered architectural rendering platform supporting text-to-render, sketch-to-render, image upscaling and more. Efficient creative tools for architects and designers.',
    keywords: ['AI architectural rendering', 'text to render', 'architectural visualization', 'design tools']
  })
}

export function usePricingSEO() {
  return useSEO({
    title: 'Pricing Plans - Choose Your Perfect Plan',
    description: 'Explore Rendaily\'s subscription plans from free to enterprise tiers. Find the perfect plan for your architectural rendering needs.',
    keywords: ['pricing plans', 'subscription tiers', 'architectural rendering service']
  })
}

export function useFeaturesSEO() {
  return useSEO({
    title: 'Features - Professional AI Rendering Tools Suite',
    description: 'Discover Rendaily\'s core features: text-to-render, sketch-to-render, image upscaling and more.',
    keywords: ['product features', 'AI rendering tools', 'text to render', 'sketch to render']
  })
}

export function useDashboardSEO() {
  return useSEO({
    title: 'Dashboard - Start Your AI Rendering Journey',
    description: 'Access Rendaily dashboard to create architectural visualizations with professional AI rendering tools.',
    keywords: ['user dashboard', 'AI rendering tools', 'project management'],
    noindex: true // User-related pages don't need indexing
  })
}

// Dynamic page SEO generator
export function generateRenderResultSEO(renderData: {
  title: string
  description: string
  imageUrl?: string
  id: string
}) {
  return generateDynamicMetadata({
    title: `${renderData.title} - AI Render Result`,
    description: renderData.description,
    image: renderData.imageUrl,
    path: `/results/${renderData.id}`,
    type: 'article'
  })
}