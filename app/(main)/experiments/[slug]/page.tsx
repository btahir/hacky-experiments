import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types'
import { fetchPost, fetchPostSlugs } from '@/lib/contentful'
import { formatContentfulDate } from '@/lib/utils'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

const DynamicCodeBlock = dynamic(() => import('./CodeBlock'))

interface ContentfulAsset {
  sys: {
    id: string
  }
  title: string
  url: string
  width?: number
  height?: number
  description?: string
}

interface ContentfulEntry {
  sys: {
    id: string
  }
  __typename: string
  language?: string
  code?: string
}

interface ExperimentPost {
  title: string
  slug: string
  description?: string
  heroImage?: {
    title?: string
    url: string
    width?: number
    height?: number
    description?: string
  }
  body?: {
    json: any
    links: any
  }
  publishDate?: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = (await fetchPost(slug)) as ExperimentPost | undefined

  if (!post) {
    return {
      title: 'Experiment Not Found',
      description: 'The requested experiment could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const canonicalPath = `/experiments/${slug}`

  return {
    title: post.title,
    description: post.description || 'Experiment details',
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title: `${post.title} | ${siteConfig.name}`,
      description: post.description || 'Experiment details',
      images: [post.heroImage?.url || siteConfig.ogImage],
      publishedTime: post.publishDate,
      authors: [siteConfig.creator.name],
    },
    twitter: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.description || 'Experiment details',
      images: [post.heroImage?.url || siteConfig.ogImage],
    },
  }
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

function getRichTextOptions(links: any) {
  const assetBlockMap =
    new Map(
      links?.assets?.block?.map((asset: ContentfulAsset) => [asset.sys.id, asset])
    ) || new Map()

  const entryMap = new Map()

  if (links?.entries?.block) {
    for (const entry of links.entries.block) {
      entryMap.set(entry.sys.id, entry)
    }
  }

  if (links?.entries?.inline) {
    for (const entry of links.entries.inline) {
      entryMap.set(entry.sys.id, entry)
    }
  }

  return {
    renderMark: {
      [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
      [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
      [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
      [MARKS.CODE]: (text: React.ReactNode) => (
        <pre className='my-4 overflow-x-auto rounded-md bg-zinc-950 px-4 py-2 text-zinc-100'>
          <code>{text}</code>
        </pre>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node: any, children: React.ReactNode) => (
        <p className='mb-4'>{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_node: any, children: React.ReactNode) => (
        <h1 className='mb-4 mt-8 text-3xl font-bold'>{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (_node: any, children: React.ReactNode) => (
        <h2 className='mb-3 mt-6 text-2xl font-bold'>{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node: any, children: React.ReactNode) => (
        <h3 className='mb-2 mt-5 text-xl font-bold'>{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (_node: any, children: React.ReactNode) => (
        <h4 className='mb-2 mt-4 text-lg font-bold'>{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (_node: any, children: React.ReactNode) => (
        <h5 className='mb-1 mt-3 text-base font-bold'>{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (_node: any, children: React.ReactNode) => (
        <h6 className='mb-1 mt-3 text-sm font-bold'>{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (_node: any, children: React.ReactNode) => (
        <ul className='mb-4 list-disc pl-5'>{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node: any, children: React.ReactNode) => (
        <ol className='mb-4 list-decimal pl-5'>{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_node: any, children: React.ReactNode) => (
        <li className='mb-1'>{children}</li>
      ),
      [BLOCKS.QUOTE]: (_node: any, children: React.ReactNode) => (
        <blockquote className='my-4 border-l-4 border-primary/30 pl-4 py-1 italic'>
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className='my-8 border-border' />,
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => (
        <a
          href={node.data.uri}
          className='text-primary hover:underline'
          target={node.data.uri.startsWith('http') ? '_blank' : '_self'}
          rel={node.data.uri.startsWith('http') ? 'noopener noreferrer' : ''}
        >
          {children}
        </a>
      ),
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        const asset = assetBlockMap.get(node.data.target.sys.id) as
          | ContentfulAsset
          | undefined

        if (!asset) {
          return null
        }

        return (
          <figure className='my-6'>
            <Image
              src={asset.url}
              alt={asset.description || asset.title || 'Embedded image'}
              className='max-w-full rounded-lg'
              width={asset.width || 1000}
              height={asset.height || 1000}
            />
            {asset.description ? (
              <figcaption className='mt-2 text-sm text-muted-foreground'>
                {asset.description}
              </figcaption>
            ) : null}
          </figure>
        )
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
        const entry = entryMap.get(node.data.target.sys.id) as
          | ContentfulEntry
          | undefined

        if (!entry) {
          return null
        }

        if (entry.__typename === 'CodeBlock') {
          return (
            <DynamicCodeBlock
              language={entry.language || 'javascript'}
              code={entry.code || ''}
            />
          )
        }

        return null
      },
    },
  }
}

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = (await fetchPost(slug)) as ExperimentPost | undefined

  if (!post) {
    notFound()
  }

  const canonicalPath = `/experiments/${slug}`

  const experimentSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate,
    author: {
      '@type': 'Person',
      name: siteConfig.creator.name,
    },
    publisher: {
      '@type': 'Person',
      name: siteConfig.creator.name,
    },
    image: post.heroImage?.url
      ? [post.heroImage.url]
      : [absoluteUrl(siteConfig.ogImage)],
    inLanguage: 'en-US',
    isPartOf: absoluteUrl('/experiments'),
    mainEntityOfPage: absoluteUrl(canonicalPath),
    url: absoluteUrl(canonicalPath),
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
          {post.publishDate ? (
            <p className='mt-3 font-mono text-xs text-muted-foreground'>
              {formatContentfulDate(post.publishDate)}
            </p>
          ) : null}
        </header>

        {post.heroImage?.url ? (
          <div className='relative mt-8 h-[320px] w-full overflow-hidden rounded-2xl sm:h-[420px]'>
            <Image
              src={post.heroImage.url}
              alt={post.heroImage.description || post.heroImage.title || post.title}
              className='h-full w-full object-cover'
              width={post.heroImage.width || 1400}
              height={post.heroImage.height || 900}
              sizes='(max-width: 1024px) 100vw, 960px'
              priority
            />
          </div>
        ) : null}

        <div className='prose mt-8 max-w-none lg:prose-lg'>
          {post.body?.json
            ? documentToReactComponents(post.body.json, getRichTextOptions(post.body.links))
            : null}

          {!post.body?.json && post.description ? <p className='text-lg'>{post.description}</p> : null}
        </div>

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(experimentSchema).replace(/</g, '\\u003c'),
          }}
        />
      </article>
    </main>
  )
}
