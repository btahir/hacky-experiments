import { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Uses | Hacky Experiments',
  description:
    "The tools, frameworks, and services I use to build AI experiments and ship fast. My product engineer tech stack for 2026.",
  alternates: {
    canonical: '/uses',
  },
  openGraph: {
    title: 'Uses | Hacky Experiments',
    description:
      "The tools, frameworks, and services I use to build AI experiments and ship fast.",
    url: '/uses',
  },
}

type Tool = {
  name: string
  description: string
  url?: string
}

type Section = {
  title: string
  tools: Tool[]
}

const sections: Section[] = [
  {
    title: 'Framework & Core',
    tools: [
      {
        name: 'Next.js',
        description:
          'My hammer. I\'ve launched close to 100 projects with it. App Router changed everything.',
        url: 'https://nextjs.org',
      },
      {
        name: 'React 19',
        description:
          'The latest and greatest. Server components are the real deal.',
        url: 'https://react.dev',
      },
      {
        name: 'TypeScript',
        description: "Can't imagine going back to vanilla JS.",
        url: 'https://www.typescriptlang.org',
      },
      {
        name: 'Tailwind CSS v4',
        description:
          'Makes everything look good without me having to be a designer.',
        url: 'https://tailwindcss.com',
      },
    ],
  },
  {
    title: 'UI & Design',
    tools: [
      {
        name: 'Shadcn UI',
        description:
          'Best component library out there. Copy-paste, customize, own it.',
        url: 'https://ui.shadcn.com',
      },
      {
        name: 'Framer Motion',
        description: 'For when you want things to feel alive.',
        url: 'https://www.framer.com/motion',
      },
      {
        name: 'Radix UI',
        description:
          "The accessibility layer I don't have to think about.",
        url: 'https://www.radix-ui.com',
      },
    ],
  },
  {
    title: 'AI & APIs',
    tools: [
      {
        name: 'Google Gemini Flash',
        description:
          'Best multimodal bang for your buck right now.',
        url: 'https://ai.google.dev',
      },
      {
        name: 'FAL AI',
        description:
          'For anything image/video model related, this is where I go. They out-executed Replicate.',
        url: 'https://fal.ai',
      },
      {
        name: 'Vercel AI SDK',
        description: 'Makes streaming AI responses trivially easy.',
        url: 'https://sdk.vercel.ai',
      },
    ],
  },
  {
    title: 'Data & Backend',
    tools: [
      {
        name: 'Supabase',
        description:
          'Auth and DB in one. My only gripe is the pricing.',
        url: 'https://supabase.com',
      },
      {
        name: 'Upstash Redis',
        description:
          'Rate limiting and caching without the ops headache.',
        url: 'https://upstash.com',
      },
      {
        name: 'Pinecone',
        description:
          "Great for getting started with vector search. Though I'm a PG_VECTOR guy at heart.",
        url: 'https://www.pinecone.io',
      },
      {
        name: 'Contentful',
        description: 'CMS for my experiments. GraphQL API is nice.',
        url: 'https://www.contentful.com',
      },
    ],
  },
  {
    title: 'Development & Deployment',
    tools: [
      {
        name: 'Claude Code / Cursor / Codex',
        description:
          'I run all three side by side and shift when I hit rate limits.',
      },
      {
        name: 'Vercel',
        description: 'Deploy and forget. First-class Next.js support.',
        url: 'https://vercel.com',
      },
      {
        name: 'VS Code',
        description: 'Still the GOAT.',
        url: 'https://code.visualstudio.com',
      },
    ],
  },
  {
    title: 'Payments',
    tools: [
      {
        name: 'Stripe',
        description: 'Solid starting point for payments. Just works.',
        url: 'https://stripe.com',
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <main className='min-h-screen py-20'>
      <div className='container mx-auto px-4 sm:px-6 max-w-4xl'>
        <div className='mb-12'>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-tighter mb-4'>
            What I <span className='text-primary'>Use</span>
          </h1>
          <p className='text-lg text-muted-foreground max-w-2xl'>
            Everyone has their hammer. Here&apos;s mine. These are the tools, frameworks,
            and services I reach for when building AI experiments and shipping fast.
          </p>
        </div>

        <div className='space-y-12'>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className='text-2xl font-bold mb-6 flex items-center gap-3'>
                {section.title}
              </h2>
              <div className='grid gap-4 sm:grid-cols-2'>
                {section.tools.map((tool) => (
                  <Card
                    key={tool.name}
                    className='surface-card overflow-hidden'
                  >
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        {tool.url ? (
                          <a
                            href={tool.url}
                            target='_blank'
                            rel='noreferrer'
                            className='hover:text-primary transition-colors'
                          >
                            {tool.name}
                          </a>
                        ) : (
                          tool.name
                        )}
                        {tool.url && (
                          <Badge
                            variant='outline'
                            className='font-mono text-[10px] tracking-wider'
                          >
                            link
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-muted-foreground text-sm'>
                        {tool.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className='mt-16 p-6 rounded-xl border border-border/60 bg-card/80'>
          <p className='text-muted-foreground text-sm'>
            <strong className='text-foreground'>Last updated:</strong> February 2026.
            This page changes as I discover better tools. The stack has stayed
            surprisingly stable though — Next.js + Tailwind + Shadcn has been my core
            for years now.
          </p>
        </div>
      </div>
    </main>
  )
}
