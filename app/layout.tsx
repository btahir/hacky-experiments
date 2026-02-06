import type { Metadata, Viewport } from 'next'
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/components/analytics'
import { absoluteUrl, siteConfig } from '@/lib/site-config'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const viewport: Viewport = {
  themeColor: '#f3ede0',
}

const defaultTitle = 'Hacky Experiments'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: defaultTitle,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator.name, url: siteConfig.creator.url }],
  creator: siteConfig.creator.name,
  publisher: siteConfig.creator.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: defaultTitle,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} open graph preview`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: siteConfig.description,
    creator: siteConfig.creator.handle,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: siteConfig.creator.name,
      url: absoluteUrl('/about'),
      sameAs: [
        siteConfig.socials.github,
        siteConfig.socials.x,
        siteConfig.socials.linkedin,
      ],
    },
    {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: 'en-US',
      publisher: {
        '@type': 'Person',
        name: siteConfig.creator.name,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${absoluteUrl('/experiments')}?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} ${ibmPlexMono.variable} min-h-screen antialiased`}
      >
        <a
          href='#main-content'
          className='sr-only fixed left-4 top-4 z-[100] rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background focus:not-sr-only'
        >
          Skip to content
        </a>
        <Analytics />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  )
}
