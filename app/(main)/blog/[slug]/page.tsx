import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import MdxLayout from '@/components/mdx-layout'
import { getAllPosts, type Post } from '@/lib/mdx'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

interface PostMetadata {
  title: string
  date: string
  excerpt: string
  tags?: string[]
}

function getFallbackMetadata(): PostMetadata {
  return {
    title: 'Untitled',
    date: new Date().toISOString(),
    excerpt: '',
    tags: [],
  }
}

function validDate(dateValue: string) {
  const parsedDate = new Date(dateValue)
  return Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : dateValue
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    const postModule = await import(`@/content/blog/${slug}.mdx`)
    const metadata = (postModule.metadata as PostMetadata) || getFallbackMetadata()
    const canonicalPath = `/blog/${slug}`

    return {
      title: `${metadata.title || 'Blog Post'} | Hacky Experiments Blog`,
      description: metadata.excerpt || 'Read our latest blog post.',
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        type: 'article',
        url: canonicalPath,
        title: `${metadata.title} | ${siteConfig.name}`,
        description: metadata.excerpt || 'Read our latest blog post.',
        images: [siteConfig.ogImage],
        publishedTime: validDate(metadata.date),
        authors: [siteConfig.creator.name],
        tags: metadata.tags,
      },
      twitter: {
        title: `${metadata.title} | ${siteConfig.name}`,
        description: metadata.excerpt || 'Read our latest blog post.',
        images: [siteConfig.ogImage],
      },
    }
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error)
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  try {
    const postModule = await import(`@/content/blog/${slug}.mdx`)
    const Post = postModule.default
    const metadata = (postModule.metadata as PostMetadata) || getFallbackMetadata()
    const canonicalPath = `/blog/${slug}`

    const allPosts = await getAllPosts()
    const currentTags = metadata.tags || []

    // Find related posts: prioritize shared tags, then chronologically adjacent
    const otherPosts = allPosts.filter((p) => p.slug !== slug)
    const relatedPosts = otherPosts
      .map((p) => {
        const sharedTags = (p.tags || []).filter((t) => currentTags.includes(t))
        return { ...p, sharedTags: sharedTags.length }
      })
      .sort((a, b) => {
        if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags
        // Fall back to chronological proximity
        const currentTime = new Date(metadata.date).getTime()
        return (
          Math.abs(new Date(a.date).getTime() - currentTime) -
          Math.abs(new Date(b.date).getTime() - currentTime)
        )
      })
      .slice(0, 3)

    const blogPostingSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: metadata.title,
      description: metadata.excerpt,
      datePublished: validDate(metadata.date),
      dateModified: validDate(metadata.date),
      author: {
        '@type': 'Person',
        name: siteConfig.creator.name,
      },
      publisher: {
        '@type': 'Person',
        name: siteConfig.creator.name,
      },
      mainEntityOfPage: absoluteUrl(canonicalPath),
      url: absoluteUrl(canonicalPath),
      keywords: metadata.tags,
      inLanguage: 'en-US',
    }

    return (
      <MdxLayout>
        <header className='mb-8 border-b border-border/80 pb-6'>
          <p className='font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground'>
            Article
          </p>
          <h1 className='mt-3 text-4xl font-bold sm:text-5xl'>{metadata.title}</h1>

          <div className='mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
            <time dateTime={metadata.date} className='font-mono text-xs'>
              {new Date(metadata.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>

            {metadata.tags?.length ? (
              <>
                <span>•</span>
                <ul className='flex flex-wrap gap-2'>
                  {metadata.tags.map((tag) => (
                    <li
                      key={tag}
                      className='rounded-full border border-border/70 bg-card/90 px-2.5 py-1 text-xs text-foreground/80'
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </header>

        <div className='prose lg:prose-lg'>
          <Post />
        </div>

        {relatedPosts.length > 0 && (
          <nav className='mt-12 border-t border-border/80 pt-8'>
            <h2 className='font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground'>
              Read Next
            </h2>
            <ul className='mt-4 space-y-4'>
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className='group block'
                  >
                    <p className='text-lg font-semibold group-hover:text-primary transition-colors'>
                      {post.title}
                    </p>
                    <p className='mt-1 text-sm text-muted-foreground line-clamp-1'>
                      {post.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostingSchema).replace(/</g, '\\u003c'),
          }}
        />
      </MdxLayout>
    )
  } catch (error) {
    console.error(`Error rendering post ${slug}:`, error)
    notFound()
  }
}
