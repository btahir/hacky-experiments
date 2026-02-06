import fs from 'node:fs/promises'
import path from 'node:path'
import type { MetadataRoute } from 'next'
import { fetchAllPosts } from '@/lib/contentful'
import { getAllPosts } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/site-config'

export const revalidate = 3600

const staticPages = ['/', '/about', '/blog', '/experiments', '/micro', '/uses', '/now']

async function getMicroPages() {
  const microDir = path.join(process.cwd(), 'app', '(micro)', 'micro')

  try {
    const entries = await fs.readdir(microDir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => `/micro/${entry.name}`)
  } catch (error) {
    console.error('Error reading micro routes for sitemap:', error)
    return []
  }
}

function validDate(dateValue: string | undefined) {
  if (!dateValue) {
    return undefined
  }

  const parsedDate = new Date(dateValue)
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [microPages, blogPosts, experiments] = await Promise.all([
    getMicroPages(),
    getAllPosts().catch((error) => {
      console.error('Error generating blog URLs for sitemap:', error)
      return []
    }),
    fetchAllPosts().catch((error) => {
      console.error('Error generating experiment URLs for sitemap:', error)
      return []
    }),
  ])

  const staticUrls: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: absoluteUrl(route),
    priority: route === '/' ? 1 : 0.8,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
  }))

  const microUrls: MetadataRoute.Sitemap = microPages.map((route) => ({
    url: absoluteUrl(route),
    priority: 0.6,
    changeFrequency: 'monthly',
  }))

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: validDate(post.date),
    priority: 0.7,
    changeFrequency: 'monthly',
  }))

  const experimentUrls: MetadataRoute.Sitemap = experiments
    .filter((post) => post?.slug)
    .map((post) => ({
      url: absoluteUrl(`/experiments/${post.slug}`),
      lastModified: validDate(post.publishDate),
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    }))

  return [...staticUrls, ...blogUrls, ...experimentUrls, ...microUrls]
}
