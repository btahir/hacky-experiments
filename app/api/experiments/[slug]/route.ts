import { NextRequest, NextResponse } from 'next/server'
import { fetchPost } from '@/lib/content/experiments'
import { acceptsMarkdown, minimalHtmlPage, representationHeaders } from '@/lib/markdown-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await fetchPost(slug.replace(/\.md$/, ''))
  if (!post) return new NextResponse('Not Found', { status: 404 })

  const canonicalPath = `/experiments/${post.slug}`
  // JSON-quoted strings are valid YAML and preserve punctuation and line breaks.
  const fullMarkdown = [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `date: ${JSON.stringify(post.publishDate)}`,
    `description: ${JSON.stringify(post.description)}`,
    `slug: ${JSON.stringify(post.slug)}`,
    ...(post.updatedAt ? [`updatedAt: ${JSON.stringify(post.updatedAt)}`] : []),
    '---',
    '',
    post.body,
  ].join('\n')

  if (slug.endsWith('.md') || acceptsMarkdown(request.headers.get('accept'))) {
    return new NextResponse(fullMarkdown, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', ...representationHeaders(canonicalPath) },
    })
  }
  return new NextResponse(minimalHtmlPage(fullMarkdown, canonicalPath), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...representationHeaders(canonicalPath) },
  })
}
