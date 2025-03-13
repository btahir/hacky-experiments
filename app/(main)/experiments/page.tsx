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
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold mb-8'>
            My <span className='text-red-500'>Experiments</span>
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
            <p className='text-lg text-gray-600'>
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
                  <Card className='h-full flex flex-col transition-all duration-200 hover:shadow-lg pt-0'>
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

            {/* Server-side pagination - simplified to just next/previous */}
            {totalPages > 1 && (
              <div className='mt-12 flex justify-center'>
                <nav className='flex items-center gap-4'>
                  {currentPage > 1 && (
                    <Link
                      href={`/experiments?page=${currentPage - 1}${
                        searchQuery ? `&search=${searchQuery}` : ''
                      }`}
                      className='inline-flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                      <span>←</span>
                      <span>Previous</span>
                    </Link>
                  )}

                  <div className='text-sm font-medium'>
                    Page {currentPage} of {totalPages}
                  </div>

                  {currentPage < totalPages && (
                    <Link
                      href={`/experiments?page=${currentPage + 1}${
                        searchQuery ? `&search=${searchQuery}` : ''
                      }`}
                      className='inline-flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800'
                    >
                      <span>Next</span>
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
