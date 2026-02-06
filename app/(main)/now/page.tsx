import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Now | Hacky Experiments',
  description:
    "What I'm currently working on, tinkering with, and thinking about. Updated monthly.",
  alternates: {
    canonical: '/now',
  },
  openGraph: {
    title: 'Now | Hacky Experiments',
    description: "What I'm currently working on, tinkering with, and thinking about.",
    url: '/now',
  },
}

type NowSection = {
  title: string
  items: { name: string; description: string }[]
}

const sections: NowSection[] = [
  {
    title: 'Currently Building',
    items: [
      {
        name: 'Hacky Experiments',
        description:
          'Always adding new micro experiments and blog posts to this site. It\'s my playground and I love it.',
      },
      {
        name: 'Jellypod',
        description:
          'AI podcast platform. Building teams, timeline editing, and a whole lot more.',
      },
    ],
  },
  {
    title: 'Currently Tinkering With',
    items: [
      {
        name: 'AI video generation workflows',
        description:
          'Kling, Seedance, Nano Banana, Veo — trying to figure out the best pipelines for consistent character animation.',
      },
      {
        name: 'Spec-driven development',
        description:
          'The Ralph Wiggum Loop with Claude Code. Write a PRD, let agents iterate through tasks while I sleep.',
      },
      {
        name: 'The agent-to-agent economy',
        description:
          'x402 protocol, machine payments, and what happens when agents start transacting with each other.',
      },
      {
        name: 'Three.js and 3D on the web',
        description:
          'Trying to reconstruct scenes from images. The models aren\'t quite there yet but it\'s getting close.',
      },
    ],
  },
  {
    title: 'Currently Creating',
    items: [
      {
        name: 'Creative Flux podcast',
        description:
          'Co-hosting with Pierson Marks. We talk about generative AI and then go off the rails into all sorts of rabbit holes. 20+ episodes in.',
      },
      {
        name: 'AI short films',
        description:
          'Using Kling, LTX, Suno, and Chatterbox to create narrative videos from scratch. The quality is getting wild.',
      },
    ],
  },
  {
    title: 'Currently Living',
    items: [
      {
        name: 'San Francisco',
        description:
          'Chasing the daylight and dodging the hills. The almond croissants from Arsicault and Philz coffee keep me going.',
      },
    ],
  },
]

export default function NowPage() {
  return (
    <main className='min-h-screen py-20'>
      <div className='container mx-auto px-4 sm:px-6 max-w-3xl'>
        <div className='mb-12'>
          <h1 className='text-4xl sm:text-5xl font-bold tracking-tighter mb-4'>
            What I&apos;m Doing <span className='text-primary'>Now</span>
          </h1>
          <p className='text-muted-foreground text-lg'>
            A snapshot of what I&apos;m focused on right now. Inspired by{' '}
            <a
              href='https://nownownow.com/about'
              target='_blank'
              rel='noreferrer'
              className='text-primary hover:text-primary/80 underline underline-offset-2'
            >
              nownownow.com
            </a>
            .
          </p>
          <p className='text-muted-foreground/60 text-sm font-mono mt-2'>
            Last updated: February 2026
          </p>
        </div>

        <div className='space-y-12'>
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className='text-2xl font-bold mb-6'>{section.title}</h2>
              <div className='space-y-6'>
                {section.items.map((item) => (
                  <div key={item.name} className='border-l-2 border-primary/30 pl-4'>
                    <h3 className='font-semibold text-lg'>{item.name}</h3>
                    <p className='text-muted-foreground mt-1'>{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
