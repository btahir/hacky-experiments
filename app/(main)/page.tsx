import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Beaker, Code, Package, ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/mdx'
import {
  HeroTextAnimation,
  HeroImageAnimation,
  SectionAnimation,
  CardAnimation,
} from './home-client'

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 3)

  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='max-w-6xl mx-auto py-12 lg:py-16 px-4 lg:px-8 flex flex-col lg:flex-row gap-12 lg:gap-8'>
        <div className='w-full lg:w-1/2 flex flex-col justify-center'>
          <HeroTextAnimation>
            <h1 className='font-bold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-foreground'>
              Welcome to my{' '}
              <span className='line-through decoration-muted-primary/60'>graveyard</span>{' '}
              portfolio of{' '}
              <span className='text-primary'>hacky experiments!</span>
            </h1>
            <p className='text-muted-foreground text-lg'>
              Here lies the remains of some of my projects. Maybe you&apos;ll
              learn. Mostly you&apos;ll laugh. Definitely you&apos;ll enjoy.
            </p>
            <div className='flex gap-3 pt-2 justify-center lg:justify-start'>
              <Link href='/experiments'>
                <Button size='lg' className='gap-2 rounded-lg'>
                  See Experiments <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href='/about'>
                <Button size='lg' variant='outline' className='rounded-lg'>
                  About Me
                </Button>
              </Link>
            </div>
          </HeroTextAnimation>
        </div>
        <HeroImageAnimation />
      </section>

      {/* Content Cards Section */}
      <section className='max-w-6xl mx-auto px-4 lg:px-8 py-16'>
        <SectionAnimation delay={0.3}>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold tracking-tight mb-4'>
              Explore My Digital Creations
            </h2>
            <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
              A collection of weird, wonderful, and occasionally useful things
              I&apos;ve built.
            </p>
          </div>
        </SectionAnimation>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-8'>
          {/* Experiments Card */}
          <CardAnimation delay={0.1}>
            <Link href='/experiments' className='block h-full'>
              <Card className='h-full surface-card surface-card-hover overflow-hidden group'>
                <CardHeader className='h-32 sm:h-40'>
                  <div className='w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3'>
                    <Beaker size={24} />
                  </div>
                  <CardTitle className='text-2xl'>Experiments</CardTitle>
                  <CardDescription>
                    Various exploratory projects and experimental ideas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground h-28'>
                    Browse through a collection of my experimental projects,
                    prototypes, and creative explorations. These are the
                    playgrounds where I test new technologies and ideas.
                  </p>
                </CardContent>
                <CardFooter className='flex justify-end items-center pt-2'>
                  <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1' />
                </CardFooter>
              </Card>
            </Link>
          </CardAnimation>

          {/* Blog Card */}
          <CardAnimation delay={0.2}>
            <Link href='/blog' className='block h-full'>
              <Card className='h-full surface-card surface-card-hover overflow-hidden group'>
                <CardHeader className='h-32 sm:h-40'>
                  <div className='w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3'>
                    <Code size={24} />
                  </div>
                  <CardTitle className='text-2xl'>Blog</CardTitle>
                  <CardDescription>
                    Thoughts, tutorials, and technical insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground h-28'>
                    My digital journal where I share programming tips,
                    development stories, and deep dives into technical topics
                    that interest me and might help others.
                  </p>
                </CardContent>
                <CardFooter className='flex justify-end items-center pt-2'>
                  <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1' />
                </CardFooter>
              </Card>
            </Link>
          </CardAnimation>

          {/* Micro-Experiments Card */}
          <CardAnimation delay={0.3}>
            <Link href='/micro' className='block h-full'>
              <Card className='h-full surface-card surface-card-hover overflow-hidden group'>
                <CardHeader className='h-32 sm:h-40'>
                  <div className='w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3'>
                    <Package size={24} />
                  </div>
                  <CardTitle className='text-2xl'>Micro Experiments</CardTitle>
                  <CardDescription>
                    Quick micro experiments demonstrating cool technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground h-28'>
                    A collection of small web experiments built to showcase
                    specific technologies and techniques. Each micro experiment
                    is built within the codebase of this site.
                  </p>
                </CardContent>
                <CardFooter className='flex justify-end items-center pt-2'>
                  <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1' />
                </CardFooter>
              </Card>
            </Link>
          </CardAnimation>
        </div>
      </section>

      {/* Latest Blog Posts Section */}
      {posts.length > 0 && (
        <section className='max-w-6xl mx-auto px-4 lg:px-8 py-16'>
          <SectionAnimation delay={0.4}>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold tracking-tight mb-4'>
                Latest from the Blog
              </h2>
              <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
                Recent thoughts, tutorials, and technical deep dives.
              </p>
            </div>
          </SectionAnimation>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post, index) => (
              <CardAnimation key={post.slug} delay={0.1 * (index + 1)}>
                <article className='surface-card surface-card-hover overflow-hidden group h-full'>
                  <Link href={`/blog/${post.slug}`} className='block h-full'>
                    <div className='p-6'>
                      <time
                        dateTime={post.date}
                        className='font-mono text-xs text-muted-foreground'
                      >
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <h3 className='text-xl font-semibold mt-2 mb-3'>
                        {post.title}
                      </h3>
                      <p className='text-foreground/70 mb-4 text-sm'>
                        {post.excerpt}
                      </p>

                      <div className='flex justify-between items-center pt-2'>
                        {post.tags && post.tags.length > 0 ? (
                          <div className='flex flex-wrap gap-1.5'>
                            {post.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant='outline'
                                className='bg-primary/5 text-primary/80 border-primary/15 font-mono text-[10px] tracking-wider'
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div></div>
                        )}
                        <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1' />
                      </div>
                    </div>
                  </Link>
                </article>
              </CardAnimation>
            ))}
          </div>

          <div className='text-center mt-10'>
            <Link href='/blog'>
              <Button variant='outline' className='gap-2 rounded-lg'>
                View all posts <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
