import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/mdx'
import { Badge } from '@/components/ui/badge'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

const description = 'Read our latest articles and experiments.'

export const metadata: Metadata = {
  title: 'Blog | Hacky Experiments',
  description,
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description,
    url: '/blog',
    type: 'website',
  },
  twitter: {
    title: `Blog | ${siteConfig.name}`,
    description,
  },
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} Blog`,
    description,
    url: absoluteUrl('/blog'),
    publisher: {
      '@type': 'Person',
      name: siteConfig.creator.name,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      description: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
    })),
  }

  return (
    <main className='min-h-screen'>
      <div className='container mx-auto px-4 py-16 lg:py-24'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-4'>Blog</h1>
          <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
            Some thoughts, I had.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className='text-center py-12 surface-card max-w-md mx-auto'>
            <div className='p-8'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center'>
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
                className='surface-card surface-card-hover overflow-hidden group'
              >
                <Link href={`/blog/${post.slug}`} className='block h-full'>
                  <div className='p-6'>
                    <time
                      dateTime={post.date}
                      className='font-mono text-xs text-muted-foreground'
                    >
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <h2 className='text-xl font-semibold mt-2 mb-3'>
                      {post.title}
                    </h2>
                    <p className='text-foreground/70 mb-4 text-sm'>{post.excerpt}</p>

                    <div className='flex justify-between items-center pt-2'>
                      {post.tags && post.tags.length > 0 ? (
                        <div className='flex flex-wrap gap-1.5'>
                          {post.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant='outline'
                              className='bg-primary/5 text-primary/80 border-primary/15 font-mono text-[10px] tracking-wider'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1' />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogSchema).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  )
}
