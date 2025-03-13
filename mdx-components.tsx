import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allow customizing built-in components, e.g. to add styling.
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold my-6">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold my-5">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold my-4">{children}</h3>
    ),
    a: ({ children, href }) => (
      <Link href={href || '/'} className="text-yellow-700 hover:text-yellow-800 font-medium">
        {children}
      </Link>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        className="rounded-lg my-8"
        {...(props as ImageProps)}
        alt={props.alt || 'Blog image'}
      />
    ),
    // Merge with the components passed from the MDX page if any
    ...components,
  }
} 