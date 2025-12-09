import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { NextConfig } from 'next'

const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeHighlight],
}

const withMDX = createMDX({
  options: mdxOptions,
})

// Define Next.js configuration
const nextConfig: NextConfig = {
  experimental: {
    mdxRs: true,
  },

  // Configure file extensions to be processed by Next.js
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      {
        protocol: 'https',
        hostname: 'assets.ctfassets.net',
      },
    ],
  },

  // Turbopack needs explicit loader rules for MDX
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': '@vercel/turbopack-next/mdx-import-source',
    },
    rules: {
      '*.mdx': {
        loaders: ['@mdx-js/loader'],
        as: '*.tsx',
      },
    },
  },
}

// Merge MDX config with Next.js config and strip deprecated experimental.turbo
const config = withMDX(nextConfig)

const experimentalConfig = (config as any).experimental
if (experimentalConfig?.turbo) {
  // Remove deprecated @next/mdx turbo block so Next stops warning
  delete experimentalConfig.turbo
}

export default config
