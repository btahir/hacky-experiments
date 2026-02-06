import AboutPage from './about-client'
import { Metadata } from 'next'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'About Me | Hacky Experiments',
  description: 'Learn more about the creator of Hacky Experiments',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description: 'Learn more about the creator of Hacky Experiments',
    url: '/about',
  },
}

export default function About() {
  return <AboutPage />
}
