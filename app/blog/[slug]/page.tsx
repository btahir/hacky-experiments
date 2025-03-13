import { notFound } from 'next/navigation'
import { getAllPosts } from '@/lib/mdx'
import { Metadata } from 'next'
import MdxLayout from '@/components/mdx-layout'

// Define types for metadata
interface PostMetadata {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Only allow pre-rendered routes
export const dynamicParams = false

// Generate metadata for each blog post
export async function generateMetadata({ 
  params,
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    // Import the blog post dynamically
    const { metadata } = await import(`@/content/blog/${params.slug}.mdx`)
    
    return {
      title: `${metadata.title || 'Blog Post'} | Hacky Experiments Blog`,
      description: metadata.excerpt || 'Read our latest blog post.',
    }
  } catch (error) {
    console.error(`Error generating metadata for ${params.slug}:`, error)
    return {
      title: 'Error Loading Post',
      description: 'There was an error loading this post.',
    }
  }
}

// Blog post page component
export default async function BlogPostPage({ 
  params,
}: { 
  params: { slug: string } 
}) {
  try {
    // Dynamically import the MDX file based on the slug
    const PostModule = await import(`@/content/blog/${params.slug}.mdx`)
    const Post = PostModule.default
    
    // Access the metadata from the module
    const metadata = PostModule.metadata as PostMetadata || {
      title: 'Untitled',
      date: new Date().toISOString(),
      excerpt: '',
      tags: [],
    }
    
    return (
      <MdxLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{metadata.title}</h1>
          
          <div className="flex items-center text-sm text-foreground/60 mb-6">
            <time dateTime={metadata.date}>
              {new Date(metadata.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            
            {metadata.tags && metadata.tags.length > 0 && (
              <>
                <span className="mx-2">•</span>
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="prose prose-yellow lg:prose-lg">
          <Post />
        </div>
      </MdxLayout>
    )
  } catch (error) {
    console.error(`Error rendering post ${params.slug}:`, error)
    notFound()
  }
} 