import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { acceptsMarkdown } from '@/lib/markdown-response'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const match = pathname.match(/^\/(blog|experiments)\/([^/]+)$/)
  if (!match) return NextResponse.next()

  const [, type, slug] = match
  const wantMarkdown = slug.endsWith('.md') || acceptsMarkdown(request.headers.get('accept'))
  if (!wantMarkdown) {
    const response = NextResponse.next()
    response.headers.set('Vary', 'Accept')
    // Next's App Router can replace Vary. Vercel routes before its CDN cache;
    // elsewhere, require revalidation so cached HTML cannot answer Markdown.
    // This changes HTTP caching only; articles remain statically generated.
    if (process.env.VERCEL !== '1') {
      response.headers.set('Cache-Control', 'private, no-cache, max-age=0, must-revalidate')
    }
    return response
  }

  const url = request.nextUrl.clone()
  url.pathname = `/api/${type}/${slug.replace(/\.md$/, '')}`
  const headers = new Headers(request.headers)
  headers.set('accept', 'text/markdown')
  const response = NextResponse.rewrite(url, { request: { headers } })
  response.headers.set('Vary', 'Accept')
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: [
    '/experiments/:path*',
    '/blog/:path*',
  ],
}
