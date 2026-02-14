import { NextRequest, NextResponse } from 'next/server'
import { CACHE_HEADERS, minimalHtmlPage } from '@/lib/markdown-response'
import fs from 'fs'
import path from 'path'

interface PostMetadata {
  title: string
  date: string
  excerpt?: string
  tags?: string[]
}

function extractMetadata(content: string): PostMetadata {
  // Try frontmatter format first
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/
  const frontmatterMatch = content.match(frontmatterRegex)

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const metadata: PostMetadata = {
      title: 'Untitled',
      date: new Date().toISOString(),
    }

    const lines = frontmatter.split('\n')
    for (const line of lines) {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) continue

      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()

      if (key === 'title') {
        metadata.title = value.replace(/^["']|["']$/g, '')
      } else if (key === 'date') {
        metadata.date = value
      } else if (key === 'excerpt') {
        metadata.excerpt = value.replace(/^["']|["']$/g, '')
      } else if (key === 'tags') {
        metadata.tags = value.replace(/^\[|\]$/g, '').split(',').map((t) => t.trim().replace(/^["']|["']$/g, ''))
      }
    }

    return metadata
  }

  // Try JavaScript export format
  const exportRegex = /export\s+const\s+metadata\s*=\s*\{([^}]+)\}/
  const exportMatch = content.match(exportRegex)

  if (exportMatch) {
    const metadataStr = exportMatch[1]
    const metadata: PostMetadata = {
      title: 'Untitled',
      date: new Date().toISOString(),
    }

    // Parse key-value pairs from the export
    const pairs = metadataStr.split(',')
    for (const pair of pairs) {
      const colonIndex = pair.indexOf(':')
      if (colonIndex === -1) continue

      const key = pair.slice(0, colonIndex).trim()
      let value = pair.slice(colonIndex + 1).trim()

      // Remove quotes
      value = value.replace(/^["']|["']$/g, '')

      if (key === 'title') {
        metadata.title = value
      } else if (key === 'date') {
        metadata.date = value
      } else if (key === 'excerpt') {
        metadata.excerpt = value
      } else if (key === 'tags') {
        // Parse array format like ['tag1', 'tag2']
        const tagMatch = value.match(/\[([^\]]+)\]/)
        if (tagMatch) {
          metadata.tags = tagMatch[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, ''))
        }
      }
    }

    return metadata
  }

  return { title: 'Untitled', date: new Date().toISOString() }
}

function extractContent(content: string): string {
  // Remove frontmatter
  let markdown = content.replace(/^---[\s\S]*?---\n/, '')

  // Remove JavaScript export
  markdown = markdown.replace(/export\s+const\s+metadata\s*=\s*\{[\s\S]*?\}\n/, '')

  return markdown.trim()
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cleanSlug = slug.replace(/\.md$/, '')
  const mdxPath = path.join(process.cwd(), 'content', 'blog', `${cleanSlug}.mdx`)

  try {
    const fileContent = fs.readFileSync(mdxPath, 'utf-8')
    const markdownContent = extractContent(fileContent)
    const accept = request.headers.get('accept') ?? ''

    if (accept.includes('text/markdown')) {
      const metadata = extractMetadata(fileContent)
      const frontmatter = [
        '---',
        `title: "${metadata.title.replace(/"/g, '\\"')}"`,
        `date: ${metadata.date}`,
        metadata.excerpt ? `description: "${metadata.excerpt.replace(/"/g, '\\"')}"` : null,
        metadata.tags ? `tags: [${metadata.tags.map((t) => `"${t}"`).join(', ')}]` : null,
        '---',
      ]
        .filter(Boolean)
        .join('\n')
      const fullMarkdown = `${frontmatter}\n\n${markdownContent}`
      return new NextResponse(fullMarkdown, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', ...CACHE_HEADERS },
      })
    }

    return new NextResponse(minimalHtmlPage(markdownContent), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...CACHE_HEADERS },
    })
  } catch (error: unknown) {
    const isNotFound = error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT'
    if (isNotFound) return new NextResponse('Not Found', { status: 404 })
    console.error('Error serving blog:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
