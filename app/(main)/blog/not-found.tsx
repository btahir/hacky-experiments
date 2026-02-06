import Link from 'next/link'

export default function BlogNotFound() {
  return (
    <main className='mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8'>
      <div className='surface-card mt-8 p-10 text-center'>
        <h1 className='text-3xl font-bold'>Blog Post Not Found</h1>
        <p className='mt-3 text-foreground/75'>
          The post does not exist or may have been moved.
        </p>
        <Link
          href='/blog'
          className='mt-6 inline-flex rounded-lg border border-border px-5 py-2 font-mono text-sm hover:bg-accent'
        >
          &larr; Back to Blog
        </Link>
      </div>
    </main>
  )
}
