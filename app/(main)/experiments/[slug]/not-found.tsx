import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
      <h2 className="text-3xl font-bold mb-4">Experiment Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        We couldn&apos;t find the experiment you&apos;re looking for.
      </p>
      <Link
        href="/experiments"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Back to All Experiments
      </Link>
    </div>
  )
} 