import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface MdxLayoutProps {
  children: React.ReactNode
}

export default function MdxLayout({ children }: MdxLayoutProps) {
  return (
    <div>
      <div className='px-4 py-8 bg-yellow-50'>
        <Link
          href='/blog'
          className='inline-flex items-center text-sm font-medium text-red-900 hover:text-red-800'
        >
          <ArrowLeft className='mr-2 size-4' />
          Back to Blog
        </Link>
      </div>

      <div className='container mx-auto px-4 pb-24'>
        <article className='prose prose-yellow max-w-3xl mx-auto'>
          {children}
        </article>
      </div>
    </div>
  )
}
