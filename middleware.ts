import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const match = pathname.match(/^\/(blog|experiments)\/([^/]+)$/)
  if (!match) return NextResponse.next()

  const [, type, slug] = match
  const wantMarkdown = slug.endsWith('.md') || (request.headers.get('accept') ?? '').includes('text/markdown')
  if (!wantMarkdown) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/api/${type}/${slug.replace(/\.md$/, '')}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/experiments/:path*',
    '/blog/:path*',
  ],
}
