import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wanimate.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/api-test/',
          '/_next/',
          '/admin/',
          '/dashboard/reset-password',
          '/sign-in',
          '/sign-up',
          '/forgot-password',
          '/*.woff',
          '/*.woff2',
          '/*.ttf',
          '/*.eot',
          '/favicon.ico',
          '/apple-icon.png',
          '/favicon-*.png',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/*.woff',
          '/*.woff2',
          '/*.ttf',
          '/*.eot',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/*.woff',
          '/*.woff2',
          '/*.ttf',
          '/*.eot',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}