'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data'

export interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Add home to breadcrumb
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    ...items
  ]

  // 生成结构化数据
  const structuredData = generateBreadcrumbSchema(
    breadcrumbItems.map(item => ({
      name: item.name,
      url: item.href
    }))
  )

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* 面包屑导航 */}
      <nav 
        className={`flex ${className}`} 
        aria-label="Breadcrumb"
      >
        <ol role="list" className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={item.name} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon 
                  className="h-4 w-4 text-muted-foreground mx-2" 
                  aria-hidden="true" 
                />
              )}
              
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {index === 0 && (
                    <HomeIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                  )}
                  {item.name}
                </Link>
              ) : (
                <span className="flex items-center text-foreground font-medium">
                  {index === 0 && (
                    <HomeIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                  )}
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  pricing: [{ name: 'Pricing', current: true }],
  features: [{ name: 'Features', current: true }],
  gallery: [{ name: 'Gallery', current: true }],
  about: [{ name: 'About Us', current: true }],
  dashboard: [{ name: 'Dashboard', current: true }],
  profile: [{ name: 'Profile', current: true }],
  settings: [
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', current: true }
  ],
  'dashboard/projects': [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Projects', current: true }
  ],
  'dashboard/gallery': [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Gallery', current: true }
  ]
}