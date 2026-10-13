import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const mdxOptions = {
  remarkPlugins: ['remark-gfm'],
  rehypePlugins: ['rehype-highlight'],
}

const withMDX = createMDX({
  options: mdxOptions,
})

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/media'
const remoteMediaPattern = mediaBaseUrl.startsWith('/')
  ? undefined
  : new URL(`${mediaBaseUrl.replace(/\/+$/, '')}/**`)
if (remoteMediaPattern && (
  remoteMediaPattern.protocol !== 'https:' ||
  remoteMediaPattern.username || remoteMediaPattern.password ||
  remoteMediaPattern.search || remoteMediaPattern.hash
)) {
  throw new Error('NEXT_PUBLIC_MEDIA_BASE_URL must be an HTTPS URL without credentials, query or fragment')
}

// Define Next.js configuration
const nextConfig: NextConfig = {
  // Configure file extensions to be processed by Next.js
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

  images: {
    remotePatterns: remoteMediaPattern ? [remoteMediaPattern] : [],
  },

  async headers() {
    return [{
      source: '/media/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }]
  },

  // Include local content in server bundles for API routes, pagination and sitemap.
  outputFileTracingIncludes: {
    '/*': ['./content/experiments/**/*.md', './content/media.json'],
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
