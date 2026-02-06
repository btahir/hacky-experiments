export const siteConfig = {
  name: 'Hacky Experiments',
  shortName: 'Hacky',
  description:
    "Bilal Tahir's playground for AI experiments, technical deep dives, and product engineering — built with Next.js, Tailwind CSS, and a love for shipping fast.",
  url: 'https://hackyexperiments.com',
  ogImage: '/opengraph-image.png',
  locale: 'en_US',
  creator: {
    name: 'Bilal Tahir',
    handle: '@deepwhitman',
    url: 'https://github.com/btahir',
  },
  socials: {
    github: 'https://github.com/btahir/hacky-experiments',
    x: 'https://twitter.com/deepwhitman',
    linkedin: 'https://www.linkedin.com/in/biltahir/',
  },
  keywords: [
    'AI experiments',
    'product engineer blog',
    'Bilal Tahir',
    'build AI apps fast',
    'spec-driven development',
    'vibe coding',
    'AI video generation workflow',
    'Next.js AI',
    'agent-to-agent economy',
    'front-end AI developer',
    'shipping fast as a developer',
    'creative AI tools',
  ],
}

export const mainNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Experiments', path: '/experiments' },
  { name: 'Micro', path: '/micro' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Uses', path: '/uses' },
]

export function absoluteUrl(path = '/') {
  return `${siteConfig.url}${path}`
}
