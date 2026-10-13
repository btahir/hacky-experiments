import fs from 'node:fs/promises'
import path from 'node:path'
import type { MetadataRoute } from 'next'
import { fetchAllPosts } from '@/lib/content/experiments'
import { getAllPosts } from '@/lib/mdx'
import { absoluteUrl } from '@/lib/site-config'

export const revalidate = 3600

const staticPages = ['/', '/about', '/blog', '/experiments', '/micro', '/uses', '/now']

async function getMicroPages() {
  const microDir = path.join(process.cwd(), 'app', '(micro)', 'micro')

  const entries = await fs.readdir(microDir, { withFileTypes: true })
  const routes = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
    const files = await fs.readdir(path.join(microDir, entry.name), { withFileTypes: true })
    return files.some((file) => file.isFile() && /^page\.(tsx?|jsx?|mdx?)$/.test(file.name))
      ? `/micro/${entry.name}`
      : undefined
  }))
  return routes.filter((route): route is string => route !== undefined)
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
    getAllPosts(),
    fetchAllPosts(),
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

  const experimentUrls: MetadataRoute.Sitemap = experiments.map((post) => ({
    url: absoluteUrl(`/experiments/${post.slug}`),
    lastModified: validDate(post.updatedAt || post.publishDate),
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticUrls, ...blogUrls, ...experimentUrls, ...microUrls]
}
