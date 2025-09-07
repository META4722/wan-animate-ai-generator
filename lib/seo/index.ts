// SEO configuration and utility functions unified export
export * from './config'
export * from './structured-data'

// Component exports
export { SEOHead } from '@/components/seo/seo-head'
export { Breadcrumb } from '@/components/seo/breadcrumb'
export { PageWrapper } from '@/components/seo/page-wrapper'
export { StructuredData, MultipleStructuredData } from '@/components/seo/structured-data'

// Hook exports
export { useSEO } from '@/hooks/use-seo'

// Convenient metadata generation functions
export { generatePageMetadata, generateDynamicMetadata } from './config'