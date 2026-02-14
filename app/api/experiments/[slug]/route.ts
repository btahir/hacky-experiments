import { NextRequest, NextResponse } from 'next/server'
import { fetchPost } from '@/lib/contentful'
import { CACHE_HEADERS, minimalHtmlPage } from '@/lib/markdown-response'
import { richTextToMarkdown, generateMarkdownDocument } from '@/lib/rich-text-to-markdown'

interface ExperimentPost {
  title: string
  slug: string
  description?: string
  body?: {
    json: any
    links: any
  }
  publishDate?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cleanSlug = slug.replace(/\.md$/, '')

  const post = (await fetchPost(cleanSlug)) as ExperimentPost | undefined
  if (!post) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const markdownContent = post.body?.json
      ? richTextToMarkdown(post.body.json, post.body.links)
      : post.description || ''
    const fullMarkdown = generateMarkdownDocument(
      post.title,
      post.publishDate || new Date().toISOString(),
      post.description || '',
      post.slug,
      markdownContent
    )
    const accept = request.headers.get('accept') ?? ''

    if (accept.includes('text/markdown')) {
      return new NextResponse(fullMarkdown, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', ...CACHE_HEADERS },
      })
    }
    return new NextResponse(minimalHtmlPage(fullMarkdown), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...CACHE_HEADERS },
    })
  } catch (error) {
    console.error('Error serving experiment:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
