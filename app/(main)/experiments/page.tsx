import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from './search-bar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { fetchAllPosts } from '@/lib/contentful'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

// Define how many posts per page
const POSTS_PER_PAGE = 6

// Generate static metadata for the page
const description = 'Browse through all our experiments and projects'

export const metadata: Metadata = {
  title: 'Experiments',
  description,
  alternates: {
    canonical: '/experiments',
  },
  openGraph: {
    title: `Experiments | ${siteConfig.name}`,
    description,
    url: '/experiments',
  },
}

export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  // Get the page from the search params, default to 1
  const { page, search } = await searchParams
  const currentPage = Number(page) || 1
  const searchQuery = search || ''

  // Fetch all posts at once (this is the server component advantage)
  const allPosts = await fetchAllPosts()

  // Filter posts if search query exists
  const filteredPosts = searchQuery
    ? allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.description &&
            post.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allPosts

  const totalPosts = filteredPosts.length

  // Calculate pagination values
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${siteConfig.name} Experiments`,
    description,
    url: absoluteUrl('/experiments'),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalPosts,
      itemListElement: paginatedPosts.map((post, index) => ({
        '@type': 'ListItem',
        position: startIndex + index + 1,
        url: absoluteUrl(`/experiments/${post.slug}`),
        name: post.title,
      })),
    },
  }

  return (
    <div>
      <div className='container mx-auto py-10 px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-8'>
            My <span className='text-primary'>Experiments</span>
          </h1>
          <p className='text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto'>
            Some experiments, I did.
          </p>
        </div>

        {/* Search Bar */}
        <div className='mb-8'>
          <SearchBar initialSearch={searchQuery} />
        </div>

        {filteredPosts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-lg text-muted-foreground'>
              No experiments found matching &quot;{searchQuery}&quot;
            </p>
            <Link
              href='/experiments'
              className='mt-4 inline-flex items-center text-primary hover:underline'
            >
              Clear search and show all experiments
            </Link>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {paginatedPosts.map((post) => (
                <Link
                  href={`/experiments/${post.slug}`}
                  key={post.sys.id}
                  className='group'
                >
                  <Card className='h-full flex flex-col surface-card surface-card-hover pt-0'>
                    {post.heroImage?.url && (
                      <div className='relative w-full h-64 overflow-hidden rounded-t-lg'>
                        <Image
                          src={post.heroImage.url}
                          alt={post.heroImage.title || post.title}
                          className='object-cover w-full h-full transition-transform duration-200 group-hover:scale-105'
                          width={post.heroImage.width || 800}
                          height={post.heroImage.height || 600}
                          sizes='(max-width: 768px) 100vw, 33vw'
                          priority={startIndex <= 3}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      {post.publishDate && (
                        <p className='font-mono text-xs text-muted-foreground'>
                          {formatDate(post.publishDate)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className='flex-grow'>
                      <p className='text-foreground/70 text-sm'>
                        {post.description}
                      </p>
                    </CardContent>
                    <CardFooter className='font-mono text-xs text-muted-foreground'>
                      read more &rarr;
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-12 flex justify-center'>
                <nav className='flex items-center gap-4'>
                  {currentPage > 1 && (
                    <Link
                      href={`/experiments?page=${currentPage - 1}${
                        searchQuery
                          ? `&search=${encodeURIComponent(searchQuery)}`
                          : ''
                      }`}
                      className='inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 font-mono text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground'
                    >
                      &larr; Previous
                    </Link>
                  )}

                  <div className='font-mono text-sm text-muted-foreground'>
                    {currentPage} / {totalPages}
                  </div>

                  {currentPage < totalPages && (
                    <Link
                      href={`/experiments?page=${currentPage + 1}${
                        searchQuery
                          ? `&search=${encodeURIComponent(searchQuery)}`
                          : ''
                      }`}
                      className='inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 font-mono text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-foreground'
                    >
                      Next &rarr;
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  )
}
