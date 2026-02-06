import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8'>
      <div className='surface-card mt-8 p-10 text-center'>
        <h2 className='text-3xl font-bold'>Experiment Not Found</h2>
        <p className='mt-3 text-foreground/75'>
          We could not find this experiment. It may have moved or been removed.
        </p>
        <Link
          href='/experiments'
          className='mt-6 inline-flex rounded-lg border border-border px-5 py-2 font-mono text-sm hover:bg-accent'
        >
          &larr; Back to Experiments
        </Link>
      </div>
    </main>
  )
}
