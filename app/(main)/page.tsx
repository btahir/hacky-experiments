'use client'

import { motion } from 'framer-motion'
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
import Image from 'next/image'

export default function Home() {
  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <section className='max-w-6xl mx-auto py-12 lg:py-16 px-4 lg:px-8 flex flex-col lg:flex-row gap-12 lg:gap-8'>
        <div className='w-full lg:w-1/2 flex flex-col justify-center'>
          <motion.div
            className='max-w-md space-y-6 w-full mx-auto lg:mx-0 text-center lg:text-left'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className='mb-2 py-1 px-3 bg-primary/10 text-primary font-mono text-xs tracking-wider'>
              // digital playground
            </Badge>
            <h1 className='font-bold text-4xl sm:text-5xl md:text-6xl tracking-tighter text-foreground'>
              Welcome to my{' '}
              <span className='line-through decoration-muted-foreground/40'>graveyard</span>{' '}
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
          </motion.div>
        </div>
        <motion.div
          className='w-full lg:w-1/2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className='relative h-[500px] sm:h-[550px] md:h-[600px]'>
            {/* Decorative elements */}
            <div className='hidden lg:block absolute -top-6 -left-6 w-20 h-20 bg-primary/15 rounded-full blur-xl'></div>
            <div className='hidden lg:block absolute -bottom-8 -right-8 w-28 h-28 bg-primary/15 rounded-full blur-xl'></div>
            <div className='hidden lg:block absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-24 bg-primary/15 rounded-full blur-lg'></div>

            {/* Nail */}
            <div className='absolute top-0 left-1/2 -translate-x-1/2 z-10'>
              <div className='w-6 h-6 rounded-full bg-neutral-700 shadow-md'></div>
              <div className='w-2 h-4 bg-neutral-800 mx-auto -mt-1 rounded-b-sm shadow-sm'></div>
            </div>

            {/* Single thread */}
            <div className='absolute top-6 left-1/2 -translate-x-1/2 h-10 w-[1px] bg-neutral-400'></div>

            {/* Hanging frame with shadow */}
            <motion.div
              className='absolute top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-[500px]'
              animate={{
                rotate: ['-1deg', '1deg', '-1deg'],
              }}
              transition={{
                duration: 6,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              {/* Frame border */}
              <div className='bg-foreground/85 p-3 rounded-xl shadow-lg transform rotate-1'>
                {/* White mat border */}
                <div className='bg-neutral-100 p-3 rounded-lg'>
                  {/* Hero image */}
                  <Image
                    alt='Hacky experiments illustration'
                    src='/hero.png'
                    className='w-full h-[350px] sm:h-[400px] md:h-[450px] object-cover rounded-lg border border-neutral-600'
                    width={1000}
                    height={1000}
                  />
                </div>
              </div>

              {/* Shadow beneath the frame */}
              <div className='absolute -bottom-4 left-1/2 -translate-x-1/2 w-[95%] h-4 bg-black/20 blur-md rounded-full'></div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Content Cards Section */}
      <section className='max-w-6xl mx-auto px-4 lg:px-8 py-16'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl font-bold tracking-tight mb-4'>
            Explore My Digital Creations
          </h2>
          <p className='text-muted-foreground text-lg max-w-2xl mx-auto'>
            A collection of weird, wonderful, and occasionally useful things
            I&apos;ve built.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-8'>
          {/* Experiments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
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
          </motion.div>

          {/* Blog Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
          </motion.div>

          {/* Micro-Experiments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
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
          </motion.div>
        </div>
      </section>
    </main>
  )
}
