import { getAllPosts } from '@/lib/mdx'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

export async function GET() {
  const posts = await getAllPosts()

  const itemsXml = posts
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/blog/${post.slug}`)}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
