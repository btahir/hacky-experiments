import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface MdxLayoutProps {
  children: React.ReactNode
}

export default function MdxLayout({ children }: MdxLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-24">
      <Link 
        href="/blog"
        className="inline-flex items-center text-sm text-foreground/60 hover:text-foreground mb-8"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Blog
      </Link>
      
      <article className="prose prose-yellow max-w-3xl mx-auto">
        {children}
      </article>
    </div>
  )
} 