import AboutPage from './about-client'
import { Metadata } from 'next'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'About Bilal Tahir | Hacky Experiments',
  description:
    'Bilal Tahir is a product engineer building at the intersection of AI, front-end, and product.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `About Bilal Tahir | ${siteConfig.name}`,
    description:
      'Product engineer building at the intersection of AI, front-end, and product.',
    url: '/about',
  },
}

const profileSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  dateCreated: '2024-01-01',
  dateModified: new Date().toISOString().split('T')[0],
  mainEntity: {
    '@type': 'Person',
    name: 'Bilal Tahir',
    alternateName: 'deepwhitman',
    url: absoluteUrl('/about'),
    image: absoluteUrl('/me.png'),
    jobTitle: 'Product Engineer',
    description:
      'Product engineer building at the intersection of AI, front-end, and product.',
    sameAs: [
      'https://github.com/btahir',
      'https://x.com/deepwhitman',
      'https://www.linkedin.com/in/biltahir/',
    ],
    knowsAbout: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'AI/LLM Integration',
      'Generative AI',
      'Product Engineering',
      'Gemini API',
      'Spec-driven Development',
      'AI Video Generation',
      'Agent-to-Agent Economy',
    ],
  },
}

export default function About() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />
      <AboutPage />
    </>
  )
}
