import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://www.fashcon.store'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
