import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
      <p className="text-lg mb-8">
        The blog post you are looking for does not exist or may have been moved.
      </p>
      <Link 
        href="/blog" 
        className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-md transition-colors"
      >
        Back to Blog
      </Link>
    </div>
  )
} 