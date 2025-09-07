'use client'

import { ReactNode } from 'react'
import { useSEO } from '@/hooks/use-seo'
import { Breadcrumb, BreadcrumbItem } from './breadcrumb'

interface PageWrapperProps {
  children: ReactNode
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noindex?: boolean
  showBreadcrumb?: boolean
  breadcrumbItems?: BreadcrumbItem[]
  className?: string
}

export function PageWrapper({
  children,
  title,
  description,
  keywords,
  image,
  noindex = false,
  showBreadcrumb = true,
  breadcrumbItems,
  className = ''
}: PageWrapperProps) {
  const seoData = useSEO({
    title,
    description,
    keywords,
    image,
    noindex
  })

  const displayBreadcrumbItems = breadcrumbItems || seoData.breadcrumbItems

  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      {showBreadcrumb && displayBreadcrumbItems.length > 0 && (
        <div className="mb-6">
          <Breadcrumb items={displayBreadcrumbItems} />
        </div>
      )}
      {children}
    </div>
  )
}

// Predefined page wrapper components
export function HomePageWrapper({ children }: { children: ReactNode }) {
  return (
    <PageWrapper
      title="AI Architectural Rendering Platform - Unleash Creativity, Make Design Simple"
      description="Professional AI-powered architectural rendering platform supporting text-to-render, sketch-to-render, image upscaling and more. Efficient creative tools for architects and designers."
      keywords={['AI architectural rendering', 'text to render', 'architectural visualization', 'design tools']}
      showBreadcrumb={false}
    >
      {children}
    </PageWrapper>
  )
}

export function PricingPageWrapper({ children }: { children: ReactNode }) {
  return (
    <PageWrapper
      title="Pricing Plans - Choose Your Perfect Plan"
      description="Explore Rendaily's subscription plans from free to enterprise tiers. Find the perfect plan for your architectural rendering needs."
      keywords={['pricing plans', 'subscription tiers', 'architectural rendering service']}
    >
      {children}
    </PageWrapper>
  )
}

export function FeaturesPageWrapper({ children }: { children: ReactNode }) {
  return (
    <PageWrapper
      title="Features - Professional AI Rendering Tools Suite"
      description="Discover Rendaily's core features: text-to-render, sketch-to-render, image upscaling and more."
      keywords={['product features', 'AI rendering tools', 'text to render', 'sketch to render']}
    >
      {children}
    </PageWrapper>
  )
}

export function DashboardPageWrapper({ children }: { children: ReactNode }) {
  return (
    <PageWrapper
      title="Dashboard - Start Your AI Rendering Journey"
      description="Access Rendaily dashboard to create architectural visualizations with professional AI rendering tools."
      keywords={['user dashboard', 'AI rendering tools', 'project management']}
      noindex={true}
    >
      {children}
    </PageWrapper>
  )
}