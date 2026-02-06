export const siteConfig = {
  name: 'Hacky Experiments',
  shortName: 'Hacky',
  description:
    'An open source playground for my coding experiments, side projects, and technical explorations.',
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
    'ai experiments',
    'nextjs projects',
    'developer portfolio',
    'technical blog',
    'contentful',
    'framer motion',
    'micro experiments',
  ],
}

export const mainNavLinks = [
  { name: 'Home', path: '/' },
  { name: 'Experiments', path: '/experiments' },
  { name: 'Micro', path: '/micro' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
]

export function absoluteUrl(path = '/') {
  return `${siteConfig.url}${path}`
}
