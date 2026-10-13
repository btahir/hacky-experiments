import { cache } from 'react'
import { experimentSlugSchema, readExperimentCollection } from './core.mjs'

export interface Experiment {
  id: string
  sys: { id: string }
  title: string
  slug: string
  description: string
  publishDate: string
  updatedAt?: string
  status: 'published' | 'draft'
  projectUrl?: string
  repositoryUrl?: string
  tags?: string[]
  body: string
  heroImage: {
    id: string
    title: string
    description: string
    url: string
    width: number
    height: number
  }
}

// React cache deduplicates metadata/page reads within a server render. Avoid a
// process-wide cache so development and subsequent builds see content edits.
export const fetchAllPosts = cache(async (): Promise<Experiment[]> => readExperimentCollection())

export async function fetchRecentPosts(limit: number): Promise<Experiment[]> {
  if (!Number.isSafeInteger(limit) || limit < 0) throw new Error('Post limit must be a non-negative integer')
  return (await fetchAllPosts()).slice(0, limit)
}

export async function fetchPostSlugs(): Promise<string[]> {
  return (await fetchAllPosts()).map((post) => post.slug)
}

export async function fetchPost(slug: string): Promise<Experiment | undefined> {
  if (!experimentSlugSchema.safeParse(slug).success) return undefined
  return (await fetchAllPosts()).find((post) => post.slug === slug)
}

export async function getPaginatedBlogPosts(page: number): Promise<{ posts: Experiment[]; total: number }> {
  if (!Number.isSafeInteger(page) || page < 1) throw new Error('Page must be a positive integer')
  const posts = await fetchAllPosts()
  return { posts: posts.slice((page - 1) * 10, page * 10), total: posts.length }
}
