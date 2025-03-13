import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { fetchPost, fetchPostSlugs } from '@/lib/contentful'
import { formatDate, formatContentfulDate } from '@/lib/utils'
import dynamic from 'next/dynamic'

const DynamicCodeBlock = dynamic(() => import('./CodeBlock'))

// Define types for Contentful assets
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

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = await params
  const post = await fetchPost(slug)

  if (!post) {
    return {
      title: 'Experiment Not Found',
      description: 'The requested experiment could not be found',
    }
  }

  return {
    title: post.title,
    description: post.description || 'Experiment details',
    openGraph: post.heroImage?.url
      ? {
          images: [{ url: post.heroImage.url }],
        }
      : undefined,
  }
}

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    const slugs = await fetchPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ExperimentPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = await params
  const post = await fetchPost(slug)

  if (!post) {
    notFound()
  }

  // Function to create rich text rendering options
  function getRichTextOptions(links: any) {
    // Create asset maps for embedded content
    const assetBlockMap =
      new Map(
        links?.assets?.block?.map((asset: ContentfulAsset) => [
          asset.sys.id,
          asset,
        ])
      ) || new Map()

    const entryMap = new Map()

    // Map block entries
    if (links?.entries?.block) {
      for (const entry of links.entries.block) {
        entryMap.set(entry.sys.id, entry)
      }
    }

    // Map inline entries
    if (links?.entries?.inline) {
      for (const entry of links.entries.inline) {
        entryMap.set(entry.sys.id, entry)
      }
    }

    // Return rendering options
    return {
      renderMark: {
        [MARKS.BOLD]: (text: React.ReactNode) => <strong>{text}</strong>,
        [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
        [MARKS.UNDERLINE]: (text: React.ReactNode) => <u>{text}</u>,
        [MARKS.CODE]: (text: React.ReactNode) => (
          <pre className='bg-gray-100 dark:bg-gray-800 py-2 px-4 rounded-md overflow-x-auto'>
            <code>{text}</code>
          </pre>
        ),
      },
      renderNode: {
        [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => (
          <p className='mb-4'>{children}</p>
        ),
        [BLOCKS.HEADING_1]: (node: any, children: React.ReactNode) => (
          <h1 className='text-3xl font-bold mt-8 mb-4'>{children}</h1>
        ),
        [BLOCKS.HEADING_2]: (node: any, children: React.ReactNode) => (
          <h2 className='text-2xl font-bold mt-6 mb-3'>{children}</h2>
        ),
        [BLOCKS.HEADING_3]: (node: any, children: React.ReactNode) => (
          <h3 className='text-xl font-bold mt-5 mb-2'>{children}</h3>
        ),
        [BLOCKS.HEADING_4]: (node: any, children: React.ReactNode) => (
          <h4 className='text-lg font-bold mt-4 mb-2'>{children}</h4>
        ),
        [BLOCKS.HEADING_5]: (node: any, children: React.ReactNode) => (
          <h5 className='text-base font-bold mt-3 mb-1'>{children}</h5>
        ),
        [BLOCKS.HEADING_6]: (node: any, children: React.ReactNode) => (
          <h6 className='text-sm font-bold mt-3 mb-1'>{children}</h6>
        ),
        [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => (
          <ul className='list-disc pl-5 mb-4'>{children}</ul>
        ),
        [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => (
          <ol className='list-decimal pl-5 mb-4'>{children}</ol>
        ),
        [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => (
          <li className='mb-1'>{children}</li>
        ),
        [BLOCKS.QUOTE]: (node: any, children: React.ReactNode) => (
          <blockquote className='border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1 my-4 italic'>
            {children}
          </blockquote>
        ),
        [BLOCKS.HR]: () => (
          <hr className='my-8 border-gray-300 dark:border-gray-700' />
        ),
        [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => (
          <a
            href={node.data.uri}
            className='text-blue-600 dark:text-blue-400 hover:underline'
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
          if (!asset) return null

          // Handle image assets
          return (
            <div className='my-6'>
              <img
                src={asset.url}
                alt={asset.title || 'Embedded image'}
                className='rounded-lg max-w-full'
                width={asset.width}
                height={asset.height}
              />
              {asset.description && (
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                  {asset.description}
                </p>
              )}
            </div>
          )
        },
        [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
          const entry = entryMap.get(node.data.target.sys.id) as
            | ContentfulEntry
            | undefined
          if (!entry) return null

          // Handle different entry types
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

  return (
    <article className='container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl'>
      {/* Back to experiments link */}
      <Link
        href='/experiments'
        className='text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 mb-6 inline-block'
      >
        ← Back to experiments
      </Link>

      <h1 className='text-4xl font-bold mt-4 mb-6'>{post.title}</h1>

      {/* Publication date */}
      {post.publishDate && (
        <div className='text-gray-500 mb-6'>
          Published on {formatContentfulDate(post.publishDate)}
        </div>
      )}

      {/* Hero image */}
      {post.heroImage?.url && (
        <div className='relative w-full h-96 mb-10 overflow-hidden rounded-lg'>
          <img
            src={post.heroImage.url}
            alt={post.heroImage.title || post.title}
            className='object-cover w-full h-full'
          />
        </div>
      )}

      {/* Content */}
      <div className='prose prose-lg dark:prose-invert max-w-none'>
        {post.body?.json &&
          documentToReactComponents(
            post.body.json,
            getRichTextOptions(post.body.links)
          )}

        {/* If there's a description but no body content, show it */}
        {!post.body?.json && post.description && (
          <p className='text-lg text-gray-700 dark:text-gray-300 mt-4'>
            {post.description}
          </p>
        )}
      </div>
    </article>
  )
}
