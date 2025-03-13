import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'

export const metadata = {
  title: 'Blog | Hacky Experiments',
  description: 'Read our latest articles and experiments.',
}

// Blog index page component
export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-foreground/70">No blog posts found.</p>
          <p className="mt-2">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.slug} 
              className="border border-yellow-100 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <div className="p-6">
                  <time dateTime={post.date} className="text-sm text-foreground/60">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                  <h2 className="text-xl font-semibold mt-2 mb-3">{post.title}</h2>
                  <p className="text-foreground/80">{post.excerpt}</p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
} 