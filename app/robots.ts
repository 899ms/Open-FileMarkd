import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/private/',
          '/admin/',
          '/*.json$',
          '/user/*',
          '/dashboard/private*',
          '/profile/billing',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/private/', '/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/private/', '/admin/'],
      },
      {
        userAgent: 'Baidubot',
        allow: '/',
        disallow: ['/api/', '/private/', '/admin/'],
      },
    ],
    sitemap: 'https://pdf2md.site/sitemap.xml',
    host: 'https://pdf2md.site',
  }
} 