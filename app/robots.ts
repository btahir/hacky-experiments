import type { MetadataRoute } from 'next'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  }
}
