import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface MdxLayoutProps {
  children: React.ReactNode
}

export default function MdxLayout({ children }: MdxLayoutProps) {
  return (
    <main className='mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8'>
      <div className='surface-card rounded-2xl px-4 py-3'>
        <Link
          href='/blog'
          className='inline-flex items-center text-sm font-medium text-primary hover:text-primary/85'
        >
          <ArrowLeft className='mr-2 size-4' />
          Back to Blog
        </Link>
      </div>

      <article className='surface-card mt-6 p-6 sm:p-8 lg:p-10'>{children}</article>
    </main>
  )
}
