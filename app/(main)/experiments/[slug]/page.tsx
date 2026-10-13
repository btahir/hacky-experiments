import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { fetchPost, fetchPostSlugs } from '@/lib/content/experiments'
import { formatDate } from '@/lib/utils'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

// Only published slugs returned at build time are valid public article routes.
export const dynamicParams = false

type ExperimentPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ExperimentPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) notFound()

  const canonicalPath = `/experiments/${post.slug}`
  const image = {
    url: absoluteUrl(post.heroImage.url),
    width: post.heroImage.width,
    height: post.heroImage.height,
    alt: post.heroImage.description || post.heroImage.title || post.title,
  }

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title: `${post.title} | ${siteConfig.name}`,
      description: post.description,
      images: [image],
      publishedTime: post.publishDate,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.creator.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${siteConfig.name}`,
      description: post.description,
      images: [image],
    },
  }
}

export async function generateStaticParams() {
  const slugs = await fetchPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ExperimentPage({ params }: ExperimentPageProps) {
  const { slug } = await params
  const post = await fetchPost(slug)
  if (!post) notFound()

  const canonicalPath = `/experiments/${post.slug}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.publishDate,
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        author: {
          '@type': 'Person',
          name: siteConfig.creator.name,
          url: absoluteUrl('/about'),
        },
        publisher: { '@type': 'Person', name: siteConfig.creator.name },
        image: [absoluteUrl(post.heroImage.url)],
        inLanguage: 'en-US',
        isPartOf: absoluteUrl('/experiments'),
        mainEntityOfPage: absoluteUrl(canonicalPath),
        url: absoluteUrl(canonicalPath),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Experiments', item: absoluteUrl('/experiments') },
          { '@type': 'ListItem', position: 3, name: post.title, item: absoluteUrl(canonicalPath) },
        ],
      },
    ],
  }

  return (
    <main className='mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8'>
      <article className='surface-card p-6 sm:p-8 lg:p-10'>
        <Link
          href='/experiments'
          className='inline-flex items-center rounded-full border border-border/80 px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-accent'
        >
          ← Back to experiments
        </Link>

        <header className='mt-6 border-b border-border/80 pb-6'>
          <h1 className='text-balance text-4xl font-bold sm:text-5xl'>{post.title}</h1>
          <p className='mt-3 font-mono text-xs text-muted-foreground'>
            <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
          </p>
        </header>

        <div className='relative mt-8 h-[320px] w-full overflow-hidden rounded-2xl sm:h-[420px]'>
          <Image
            src={post.heroImage.url}
            alt={post.heroImage.description || post.heroImage.title || post.title}
            className='h-full w-full object-cover'
            width={post.heroImage.width}
            height={post.heroImage.height}
            sizes='(max-width: 1024px) 100vw, 960px'
            priority
          />
        </div>

        <div className='prose mt-8 max-w-none lg:prose-lg'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              a: ({ href, children }) => (
                <a
                  href={href}
                  className='text-primary hover:underline'
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
      </article>
    </main>
  )
}
