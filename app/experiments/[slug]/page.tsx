import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { fetchPost, fetchPostSlugs } from '@/lib/contentful'
import { formatDate } from '@/lib/utils'

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug)
  
  if (!post) {
    return {
      title: 'Experiment Not Found',
      description: 'The requested experiment could not be found',
    }
  }
  
  return {
    title: post.title,
    description: post.description || 'Experiment details',
    openGraph: post.heroImage?.url ? {
      images: [{ url: post.heroImage.url }],
    } : undefined,
  }
}

// Generate static params for all posts
export async function generateStaticParams() {
  try {
    const slugs = await fetchPostSlugs()
    return slugs.map(slug => ({ slug }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function ExperimentPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug)
  
  if (!post) {
    notFound()
  }
  
  return (
    <article className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      {/* Back to experiments link */}
      <Link 
        href="/experiments" 
        className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 mb-6 inline-block"
      >
        ← Back to experiments
      </Link>
      
      <h1 className="text-4xl font-bold mt-4 mb-6">{post.title}</h1>
      
      {/* Publication date */}
      {post.publishDate && (
        <div className="text-gray-500 mb-6">
          Published on {formatDate(post.publishDate)}
        </div>
      )}
      
      {/* Hero image */}
      {post.heroImage?.url && (
        <div className="relative w-full h-96 mb-10 overflow-hidden rounded-lg">
          <img
            src={post.heroImage.url}
            alt={post.heroImage.title || post.title}
            className="object-cover"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {/* 
          Note: Actual content rendering depends on how your content is structured.
          You may need to implement a rich text renderer for Contentful's content model.
          
          For example, if using @contentful/rich-text-react-renderer:
          
          import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
          import { BLOCKS, INLINES } from '@contentful/rich-text-types';
          
          // Then render with:
          {documentToReactComponents(post.body.json, options)}
        */}
        
        {/* For now, let's add a simple message */}
        <p className="text-gray-700 dark:text-gray-300">
          To fully render the content from Contentful, you would need to implement a 
          rich text renderer that handles Contentful's content structure.
        </p>
        
        {/* If there's a description, show it */}
        {post.description && (
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
            {post.description}
          </p>
        )}
      </div>
    </article>
  )
} 