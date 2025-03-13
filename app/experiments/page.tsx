import Link from 'next/link'
import { fetchAllPosts } from '@/lib/contentful'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import { SearchBar } from './search-bar'

// Define how many posts per page
const POSTS_PER_PAGE = 6

// Generate static metadata for the page
export const metadata = {
  title: 'Experiments',
  description: 'Browse through all our experiments and projects',
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

  return (
    <div className='bg-yellow-50'>
      <div className='container mx-auto py-10 px-4 sm:px-6 lg:px-8'>
        <h1 className='text-4xl font-bold mb-8'>Experiments</h1>

        {/* Search Bar */}
        <div className='mb-8'>
          <SearchBar initialSearch={searchQuery} />
        </div>

        {filteredPosts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-lg text-gray-600'>
              No experiments found matching "{searchQuery}"
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
                  <Card className='h-full flex flex-col transition-all duration-200 hover:shadow-lg'>
                    {post.heroImage?.url && (
                      <div className='relative w-full h-48 overflow-hidden rounded-t-lg'>
                        <Image
                          src={post.heroImage.url}
                          alt={post.heroImage.title || post.title}
                          className='object-cover w-full h-full transition-transform duration-200 group-hover:scale-105'
                          width={post.heroImage.width}
                          height={post.heroImage.height}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      {post.publishDate && (
                        <CardDescription>
                          Published on {formatDate(post.publishDate)}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className='flex-grow'>
                      <p className='text-gray-600 dark:text-gray-300'>
                        {post.description}
                      </p>
                    </CardContent>
                    <CardFooter className='text-sm text-gray-500'>
                      Read more →
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Server-side pagination - generate links to different pages */}
            {totalPages > 1 && (
              <div className='mt-12 flex justify-center'>
                <nav className='flex items-center gap-1'>
                  {currentPage > 1 && (
                    <Link
                      href={`/experiments?page=${currentPage - 1}${
                        searchQuery ? `&search=${searchQuery}` : ''
                      }`}
                      className='inline-flex items-center gap-1 px-2.5 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                      <span>←</span>
                      <span className='hidden sm:inline'>Previous</span>
                    </Link>
                  )}

                  <div className='flex items-center gap-1'>
                    {/* Generate pagination numbers with ellipsis */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNumber = i + 1
                      // Always show first page, last page, current page, and pages around current
                      const showPageNumber =
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1) ||
                        (pageNumber === 2 && currentPage <= 4) ||
                        (pageNumber === totalPages - 1 &&
                          currentPage >= totalPages - 3)

                      // Show ellipsis after first page if needed
                      if (pageNumber === 2 && currentPage > 4) {
                        return (
                          <span
                            key={`ellipsis-start`}
                            className='inline-flex h-9 w-9 items-center justify-center'
                          >
                            …
                          </span>
                        )
                      }

                      // Show ellipsis before last page if needed
                      if (
                        pageNumber === totalPages - 1 &&
                        currentPage < totalPages - 3
                      ) {
                        return (
                          <span
                            key={`ellipsis-end`}
                            className='inline-flex h-9 w-9 items-center justify-center'
                          >
                            …
                          </span>
                        )
                      }

                      if (showPageNumber) {
                        return (
                          <Link
                            key={i}
                            href={`/experiments?page=${pageNumber}${
                              searchQuery ? `&search=${searchQuery}` : ''
                            }`}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm ${
                              currentPage === pageNumber
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNumber}
                          </Link>
                        )
                      }

                      return null
                    })}
                  </div>

                  {currentPage < totalPages && (
                    <Link
                      href={`/experiments?page=${currentPage + 1}${
                        searchQuery ? `&search=${searchQuery}` : ''
                      }`}
                      className='inline-flex items-center gap-1 px-2.5 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                      <span className='hidden sm:inline'>Next</span>
                      <span>→</span>
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
