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
import {
  Beaker,
  Code,
  Package,
  ArrowRight,
} from 'lucide-react'

export default function Home() {
  return (
    <main className='min-h-screen bg-yellow-50'>
      {/* Hero Section */}
      <section className='max-w-6xl mx-auto py-8 lg:py-12 px-4 lg:px-8 flex flex-col lg:flex-row space-y-8 lg:space-y-0'>
        <div className='w-full lg:w-1/2 flex flex-col justify-center'>
          <motion.div
            className='max-w-sm lg:max-w-md space-y-6 w-full mx-auto lg:mx-0 text-center lg:text-left'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className='mb-2 text-sm py-1 px-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-200'>
              Welcome to my digital playground
            </Badge>
            <h1 className='font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground'>
              Welcome to my <span className='line-through'>graveyard</span>{' '}
              portfolio of{' '}
              <span className='text-red-500 font-bold'>hacky experiments!</span>
            </h1>
            <p className='text-muted-foreground text-lg md:text-xl'>
              Here lies the remains of some of my projects. Maybe you'll learn.
              Mostly you'll laugh. Definitely you'll enjoy.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start'>
              <Link href='/experiments'>
                <Button size='lg' className='gap-2 bg-red-500 hover:bg-red-600'>
                  See Experiments <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href='/about'>
                <Button size='lg' variant='outline' className='border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600'>
                  About Me
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div
          className='w-full lg:w-1/2'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className='relative'>
            {/* Decorative elements */}
            <div className='absolute -top-6 -left-6 w-20 h-20 bg-yellow-200/50 rounded-full blur-xl'></div>
            <div className='absolute -bottom-8 -right-8 w-28 h-28 bg-yellow-200/50 rounded-full blur-xl'></div>
            <div className='absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-24 bg-yellow-200/50 rounded-full blur-lg'></div>

            {/* Gradient border effect */}
            <div className='absolute inset-0 bg-yellow-100/50 rounded-2xl p-1'>
              <div className='absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl'></div>
            </div>

            {/* Pattern overlay */}
            <div className='absolute inset-0 opacity-10 mix-blend-overlay'>
              <div
                className='w-full h-full'
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20px 20px, #f0f0f0 2px, transparent 0), radial-gradient(circle at 40px 70px, #f0f0f0 2px, transparent 0), radial-gradient(circle at 120px 120px, #f0f0f0 2px, transparent 0)',
                  backgroundSize: '150px 150px',
                }}
              ></div>
            </div>

            {/* Main image with softer background */}
            <div className='relative bg-neutral-800 backdrop-blur-sm rounded-xl overflow-hidden p-6'>
              {/* Hero image */}
              <img
                alt='Hacky experiments illustration'
                src='/hero.png'
                className='w-full h-[400px] sm:h-[450px] md:h-[500px] object-cover rounded-lg border border-neutral-600'
              />

              {/* Animated dots */}
              <motion.div
                className='absolute top-10 right-10 w-12 h-12 bg-yellow-200/50 rounded-full'
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 3,
                  ease: 'easeInOut',
                }}
              ></motion.div>
              <motion.div
                className='absolute bottom-16 left-10 w-8 h-8 bg-yellow-200/50 rounded-full'
                animate={{ y: [0, 10, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2.5,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              ></motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content Cards Section - Replacing Tabs */}
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
            I've built.
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
              <Card className='h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-yellow-200 overflow-hidden group'>
                <CardHeader className='pb-2'>
                  <div className='w-12 h-12 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center mb-3'>
                    <Beaker size={24} />
                  </div>
                  <CardTitle className='text-2xl'>Experiments</CardTitle>
                  <CardDescription>
                    Various exploratory projects and experimental ideas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground'>
                    Browse through a collection of my experimental projects,
                    prototypes, and creative explorations. These are the
                    playgrounds where I test new technologies and ideas.
                  </p>
                </CardContent>
                <CardFooter className='flex justify-between items-center pt-2'>
                  <div className='flex space-x-1'>
                    <Badge variant='outline' className='bg-yellow-50'>
                      React
                    </Badge>
                    <Badge variant='outline' className='bg-yellow-50'>
                      Next.js
                    </Badge>
                    <Badge variant='outline' className='bg-yellow-50'>
                      TypeScript
                    </Badge>
                  </div>
                  <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-yellow-600 transition-colors duration-300 group-hover:translate-x-1' />
                </CardFooter>
              </Card>
            </Link>
          </motion.div>

          {/* Code Snippets Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href='/snippets' className='block h-full'>
              <Card className='h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-yellow-200 overflow-hidden group'>
                <CardHeader className='pb-2'>
                  <div className='w-12 h-12 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center mb-3'>
                    <Code size={24} />
                  </div>
                  <CardTitle className='text-2xl'>Code Snippets</CardTitle>
                  <CardDescription>
                    Useful code fragments and programming solutions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground'>
                    A library of reusable code snippets, clever hacks, and
                    programming solutions that I've developed over time. Find
                    useful code for common programming challenges.
                  </p>
                </CardContent>
                <CardFooter className='flex justify-between items-center pt-2'>
                  <div className='flex space-x-1'>
                    <Badge variant='outline' className='bg-yellow-50'>
                      JavaScript
                    </Badge>
                    <Badge variant='outline' className='bg-yellow-50'>
                      Python
                    </Badge>
                    <Badge variant='outline' className='bg-yellow-50'>
                      CSS
                    </Badge>
                  </div>
                  <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-yellow-600 transition-colors duration-300 group-hover:translate-x-1' />
                </CardFooter>
              </Card>
            </Link>
          </motion.div>

          {/* Products Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href='/products' className='block h-full'>
              <Card className='h-full hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-yellow-200 overflow-hidden group'>
                <CardHeader className='pb-2'>
                  <div className='w-12 h-12 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center mb-3'>
                    <Package size={24} />
                  </div>
                  <CardTitle className='text-2xl'>Products</CardTitle>
                  <CardDescription>
                    Complete products and fully developed applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground'>
                    Polished and production-ready applications that solve
                    real-world problems. These are my most refined works,
                    developed with a focus on user experience and functionality.
                  </p>
                </CardContent>
                <CardFooter className='flex justify-between items-center pt-2'>
                  <div className='flex space-x-1'>
                    <Badge variant='outline' className='bg-yellow-50'>
                      SaaS
                    </Badge>
                    <Badge variant='outline' className='bg-yellow-50'>
                      Mobile
                    </Badge>
                    <Badge variant='outline' className='bg-yellow-50'>
                      Web
                    </Badge>
                  </div>
                  <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-yellow-600 transition-colors duration-300 group-hover:translate-x-1' />
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Keep the other sections as needed */}
    </main>
  )
}
