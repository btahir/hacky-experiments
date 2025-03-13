import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { NextConfig } from "next"

// Configure MDX options
const withMDX = createMDX({
  options: {
    // Add markdown plugins for enhanced functionality
    remarkPlugins: [remarkGfm], // GitHub Flavored Markdown
    rehypePlugins: [rehypeHighlight], // Syntax highlighting
  },
})

// Define Next.js configuration
const nextConfig: NextConfig = {
  // Configure file extensions to be processed by Next.js
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Add image domains if needed for blog images
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

// Merge MDX config with Next.js config and export
export default withMDX(nextConfig)
