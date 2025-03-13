import Link from 'next/link'
import { getAllPosts } from '@/lib/mdx'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Blog | Hacky Experiments',
  description: 'Read our latest articles and experiments.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <main className='min-h-screen bg-yellow-50'>
      <div className='container mx-auto px-4 py-16 lg:py-24'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-4'>Blog</h1>
          <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
            Some thoughts, I had.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl shadow-sm border border-yellow-100 max-w-md mx-auto'>
            <div className='p-8'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center'>
                <span className='text-2xl'>📝</span>
              </div>
              <p className='text-lg text-foreground/70'>No blog posts found.</p>
              <p className='mt-2 text-muted-foreground'>
                Check back soon for new content!
              </p>
            </div>
          </div>
        ) : (
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.slug}
                className='bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2 border-transparent hover:border-yellow-200 group'
              >
                <Link href={`/blog/${post.slug}`} className='block h-full'>
                  <div className='p-6'>
                    <time
                      dateTime={post.date}
                      className='text-sm text-foreground/60'
                    >
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <h2 className='text-xl font-semibold mt-2 mb-3'>
                      {post.title}
                    </h2>
                    <p className='text-foreground/80 mb-4'>{post.excerpt}</p>

                    <div className='flex justify-between items-center pt-2'>
                      {post.tags && post.tags.length > 0 ? (
                        <div className='flex flex-wrap gap-2'>
                          {post.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant='outline'
                              className='bg-yellow-50 text-yellow-700 border-yellow-200'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-yellow-600 transition-colors duration-300 group-hover:translate-x-1' />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
